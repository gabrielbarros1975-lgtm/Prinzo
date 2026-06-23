import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken || accessToken === 'COLE_AQUI_SEU_ACCESS_TOKEN') {
      return NextResponse.json({ error: 'Access Token do Mercado Pago não configurado' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Mercado Pago strictly requires HTTPS and public domains for back_urls since 2025.
    // If the base URL is local (http://localhost), we use a placeholder HTTPS URL for the API payload
    // so checkout creation succeeds, allowing testing. If using a tunnel (e.g. ngrok), the original URL is kept.
    const isLocal = baseUrl.includes('localhost') || baseUrl.startsWith('http://');
    const mpBaseUrl = isLocal ? 'https://example.com' : baseUrl;

    const preferenceData = {
      items: items.map(item => ({
        id: String(item.id),
        title: item.name,
        quantity: item.qty,
        unit_price: Number(item.price),
        currency_id: 'BRL',
      })),
      back_urls: {
        success: `${mpBaseUrl}/pagamento?status=approved`,
        failure: `${mpBaseUrl}/pagamento?status=failure`,
        pending: `${mpBaseUrl}/pagamento?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'LJVision',
      metadata: {
        store: 'ljvision',
      },
    };


    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({ init_point: result.init_point });
  } catch (err) {
    console.error('[MP Checkout]', err);
    return NextResponse.json({ error: err.message || 'Erro ao criar preferência de pagamento' }, { status: 500 });
  }
}
