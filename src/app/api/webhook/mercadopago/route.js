import crypto from 'crypto';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

function normaliseHeaderValue(value) {
  if (value === undefined || value === null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const trimmed = String(raw).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseMpSignatureHeader(header) {
  const hashes = {};
  let ts;
  for (const part of String(header).split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.substring(0, eq).trim().toLowerCase();
    const value = part.substring(eq + 1).trim();
    if (!key || !value) continue;
    if (key === 'ts') {
      ts = value;
    } else if (/^v\d+$/.test(key)) {
      hashes[key] = value;
    }
  }
  return { ts, hashes };
}

function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function validateMpWebhookSignature({ xSignature, xRequestId, dataId, secret, toleranceSeconds = 300 }) {
  if (!xSignature) {
    const error = new Error('Missing signature header');
    error.reason = 'MissingSignatureHeader';
    throw error;
  }

  const { ts, hashes } = parseMpSignatureHeader(xSignature);
  if (!ts || !/^[0-9]+$/.test(ts)) {
    const error = new Error('Malformed or missing timestamp in signature header');
    error.reason = 'MalformedSignatureHeader';
    throw error;
  }

  const version = Object.keys(hashes).find(key => /^v\d+$/.test(key));
  if (!version) {
    const error = new Error('Missing hash version in signature header');
    error.reason = 'MissingHash';
    throw error;
  }

  const receivedHash = hashes[version];
  const manifest = [`id:${String(dataId).toLowerCase()}`, `request-id:${xRequestId}`, `ts:${ts}`].filter(Boolean).join(';') + ';';
  const computedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  if (!constantTimeEquals(computedHash, receivedHash)) {
    const error = new Error('Signature mismatch');
    error.reason = 'SignatureMismatch';
    throw error;
  }

  const tsNum = Number(ts);
  const tsMs = tsNum > 1e12 ? tsNum : tsNum * 1000;
  const driftSeconds = Math.abs(Date.now() - tsMs) / 1000;
  if (driftSeconds > toleranceSeconds) {
    const error = new Error('Timestamp out of tolerance');
    error.reason = 'TimestampOutOfTolerance';
    error.timestamp = ts;
    throw error;
  }
}

export async function POST(req) {
  try {
    const signature =
      req.headers.get('x-signature') ||
      req.headers.get('x-hub-signature') ||
      req.headers.get('x-mp-signature') ||
      req.headers.get('x-mercadopago-signature');
    const requestId = req.headers.get('x-request-id') || req.headers.get('x-mp-request-id');
    const secret = process.env.MP_WEBHOOK_SIGNATURE;

    if (!secret) {
      console.error('[MP Webhook] Missing MP_WEBHOOK_SIGNATURE');
      return NextResponse.json({ error: 'Webhook signature secret não configurada.' }, { status: 500 });
    }

    if (!signature || !requestId) {
      console.error('[MP Webhook] Missing webhook auth headers', {
        signature,
        requestId,
        headers: Object.fromEntries(req.headers.entries()),
      });
      return NextResponse.json(
        { error: 'Headers de autenticação do webhook não foram encontrados.' },
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

    const signatureTimestamp = signature ? parseInt(String(signature).match(/ts=(\d+)/)?.[1], 10) : null;
    const currentUnix = Math.floor(Date.now() / 1000);
    const toleranceSeconds = 900; // 15 minutes tolerance to absorb small clock drift

    try {
      validateMpWebhookSignature({
        xSignature: signature,
        xRequestId: requestId,
        dataId: String(dataId),
        secret,
        toleranceSeconds,
      });
    } catch (err) {
      console.error('[MP Webhook] Signature validation failed', {
        error: err,
        signature,
        requestId,
        dataId,
        toleranceSeconds,
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

    let paymentResponse;
    try {
      paymentResponse = await paymentClient.get({ id: String(dataId) });
    } catch (err) {
      console.error('[MP Webhook] Failed to fetch payment', { error: err, dataId, requestId });
      return NextResponse.json({ status: 'ignored', message: 'Falha ao buscar pagamento; webhook ignorado.' });
    }

    const payment = paymentResponse?.body || paymentResponse;
    if (!payment || payment.status !== 'approved') {
      console.info('[MP Webhook] Payment not approved or not found', {
        dataId,
        paymentStatus: payment?.status,
        payment,
      });
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

    const subscriptionStartedAt = new Date().toISOString();
    const subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .update({
        subscription_active: true,
        subscription_plan: 'monthly',
        subscription_status: 'active',
        subscription_started_at: subscriptionStartedAt,
        subscription_expires_at: subscriptionExpiresAt,
        mp_subscription_payment_id: String(payment?.id || dataId),
      })
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
