import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
  try {
    const { items, store_slug } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // Tentar buscar o token da loja específica do Supabase
    let accessToken = null;
    let storeName = 'Loja';

    if (store_slug) {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('mp_access_token, name')
        .eq('slug', store_slug)
        .single();

      if (!storeError && store?.mp_access_token) {
        accessToken = store.mp_access_token;
        storeName = store.name;
      }
    }

    // Fallback: usar o token global do .env (compatibilidade retroativa)
    if (!accessToken) {
      accessToken = process.env.MP_ACCESS_TOKEN;
    }

    if (!accessToken || accessToken.startsWith('COLE_AQUI')) {
      return NextResponse.json(
        { error: 'Access Token do Mercado Pago não configurado. Configure nas configurações da loja.' },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const requestUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin;

    // O slug de retorno vai para /[storeSlug]/pagamento ou /pagamento genérico
    const returnBase = store_slug ? `${baseUrl}/${store_slug}/pagamento` : `${baseUrl}/pagamento`;

    const preferenceData = {
      items: items.map(item => ({
        id: String(item.id),
        title: item.customName ? `${item.name} (Base: ${item.customName})` : item.name,
        quantity: item.qty,
        unit_price: Number(item.price),
        currency_id: 'BRL',
      })),

      back_urls: {
        success: `${returnBase}?status=approved`,
        failure: `${returnBase}?status=failure`,
        pending: `${returnBase}?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: storeName.substring(0, 22),
      metadata: {
        store: store_slug || 'default',
      },
    };

    const result = await preference.create({ body: preferenceData });
    return NextResponse.json({ init_point: result.init_point });

  } catch (err) {
    console.error('[MP Checkout]', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao criar preferência de pagamento' },
      { status: 500 }
    );
  }
}
