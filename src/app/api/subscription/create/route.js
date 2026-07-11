import { supabaseAdmin } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago';

/**
 * POST /api/subscription/upgrade
 * Cria uma assinatura recorrente no Mercado Pago
 */
export async function POST(req) {
  try {
    const { storeSlug, email, cardholder } = await req.json();

    if (!storeSlug || !email) {
      return NextResponse.json(
        { error: 'storeSlug e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar a loja
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id, mp_access_token, name, monthly_price')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Usar o token do Mercado Pago
    const accessToken = store.mp_access_token || process.env.MP_ACCESS_TOKEN;
    if (!accessToken || accessToken.startsWith('COLE_AQUI')) {
      return NextResponse.json(
        { error: 'Mercado Pago não configurado para esta loja' },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });

    // Criar o plano de pre-aprovação (assinatura)
    const plan = new PreApprovalPlan(client);
    const planData = {
      reason: `${store.name} - Assinatura Mensal`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: store.monthly_price / 100, // Converter de centavos para reais
        currency_id: 'BRL',
      },
      payer_email: email,
      back_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${storeSlug}/pagamento?subscription=success`,
    };

    const planResult = await plan.create({ body: planData });

    // Retornar o init_point para o usuário pagar
    return NextResponse.json({
      planId: planResult.id,
      initPoint: planResult.init_point,
      monthlyPrice: store.monthly_price / 100,
      storeName: store.name,
    });

  } catch (err) {
    console.error('[Subscription Create]', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao criar assinatura' },
      { status: 500 }
    );
  }
}
