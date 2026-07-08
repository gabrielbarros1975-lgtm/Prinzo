import { MercadoPagoConfig, Payment, WebhookSignatureValidator } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(req) {
  try {
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    const secret = process.env.MP_WEBHOOK_SIGNATURE;

    if (!secret) {
      console.error('[MP Webhook] Missing MP_WEBHOOK_SIGNATURE');
      return NextResponse.json({ error: 'Webhook signature secret não configurada.' }, { status: 500 });
    }

    if (!signature || !requestId) {
      console.error('[MP Webhook] Missing x-signature or x-request-id header', { signature, requestId });
      return NextResponse.json(
        { error: 'Headers x-signature e x-request-id são obrigatórios para autenticação do webhook.' },
        { status: 400 }
      );
    }

    const bodyText = await req.text();
    let payload;

    try {
      payload = JSON.parse(bodyText);
    } catch (err) {
      console.error('[MP Webhook] Invalid JSON payload', err);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const eventType = String(payload.type || payload.topic || payload.event || '').toLowerCase();
    const dataId = payload?.data?.id || payload?.id || payload?.resource?.id || payload?.data?.resource?.id;
    if (!dataId) {
      console.error('[MP Webhook] Missing resource id in webhook payload', payload);
      return NextResponse.json({ error: 'ID do recurso não encontrado no webhook' }, { status: 400 });
    }

    try {
      WebhookSignatureValidator.validate({
        xSignature: signature,
        xRequestId: requestId,
        dataId: String(dataId),
        secret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      console.error('[MP Webhook] Signature validation failed', {
        error: err,
        signature,
        requestId,
        dataId,
      });
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    if (eventType.includes('merchant_order') || (eventType === 'update' && String(payload.topic || '').includes('merchant_order'))) {
      console.info('[MP Webhook] Ignoring merchant_order event', eventType, payload.topic, dataId);
      return NextResponse.json({ status: 'ignored', message: 'Merchant order event ignored.' });
    }

    if (!eventType.startsWith('payment')) {
      console.info('[MP Webhook] Ignoring unsupported event type', eventType, payload.topic, dataId);
      return NextResponse.json({ status: 'ignored', message: 'Webhook ignored, unsupported event type.' });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[MP Webhook] Missing MP_ACCESS_TOKEN');
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const paymentResponse = await paymentClient.get({ id: String(dataId) });
    const payment = paymentResponse?.body || paymentResponse;

    if (!payment || payment.status !== 'approved') {
      return NextResponse.json({ status: 'ignored', message: 'Pagamento não aprovado ou não encontrado.' });
    }

    let storeId = payment?.metadata?.store_id || payment?.order?.metadata?.store_id;
    const externalReference = payment?.external_reference || payment?.order?.external_reference;

    if (!storeId && externalReference) {
      try {
        const parsed = JSON.parse(externalReference);
        if (parsed?.store_id) storeId = parsed.store_id;
      } catch (parseError) {
        const match = String(externalReference).match(/store[:\-](\d+)/);
        if (match) storeId = match[1];
      }
    }

    if (!storeId) {
      console.error('[MP Webhook] store_id not present in payment metadata or external_reference', {
        payment,
        externalReference,
      });
      return NextResponse.json({ error: 'store_id ausente no metadata do pagamento.' }, { status: 400 });
    }

    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .update({ subscription_active: true })
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      console.error('[MP Webhook] Supabase update failed', error);
      return NextResponse.json({ error: 'Falha ao atualizar status da assinatura.' }, { status: 500 });
    }

    console.info(`[MP Webhook] Subscription activated for store ${storeId}`);
    return NextResponse.json({ status: 'success', store });
  } catch (err) {
    console.error('[MP Webhook] Unexpected error', err);
    return NextResponse.json({ error: err.message || 'Erro interno no webhook' }, { status: 500 });
  }
}
