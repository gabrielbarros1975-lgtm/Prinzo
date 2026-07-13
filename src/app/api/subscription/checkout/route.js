import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

const PLAN_PRICE = 20.00; // R$ 20,00 mensalmente

export async function POST(req) {
  try {
    const { store_id, store_slug } = await req.json();

    if (!store_id || !store_slug) {
      return NextResponse.json({ error: 'store_id e store_slug são obrigatórios' }, { status: 400 });
    }

    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id, name, slug, owner_email, mp_access_token')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    const accessToken = store.mp_access_token || process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Mercado Pago não configurado' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const requestUrl = new URL(req.url);
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl = envBaseUrl ? envBaseUrl.replace(/\/$/, '') : requestUrl.origin;
    const returnBase = `${baseUrl}/admin`;

    const preferenceData = {
      items: [
        {
          id: 'prinzo-monthly-plan',
          title: 'Prinzo — Plano Mensal',
          description: `Assinatura mensal da loja ${store.name} no Prinzo`,
          quantity: 1,
          unit_price: PLAN_PRICE,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: store.owner_email,
      },
      back_urls: {
        success: `${returnBase}?subscription=success`,
        failure: `${returnBase}?subscription=failure`,
        pending: `${returnBase}?subscription=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'PRINZO ASSINATURA',
      notification_url: `${baseUrl}/api/webhook/mercadopago`,
      metadata: {
        store_id: store.id,
        store_slug: store.slug,
        plan: 'monthly',
      },
      external_reference: JSON.stringify({
        source: 'prinzo_subscription',
        store_id: store.id,
        store_slug: store.slug,
      }),
    };

    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({ init_point: result.init_point });
  } catch (err) {
    console.error('[Subscription Checkout]', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao criar preferência de assinatura' },
      { status: 500 }
    );
  }
}
