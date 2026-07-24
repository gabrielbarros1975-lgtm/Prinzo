import { supabaseAdmin } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

/**
 * GET /api/subscription/status?slug=store-slug
 * Fonte única de verdade sobre acesso da loja (trial ou assinatura paga).
 * Deriva o status direto dos campos crus (subscription_active, trial_end_date,
 * subscription_expires_at) e persiste no banco quando detecta expiração.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug é obrigatório' },
        { status: 400 }
      );
    }

    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select('id, slug, subscription_status, trial_start_date, trial_end_date, subscription_active, subscription_expires_at, monthly_price')
      .eq('slug', slug)
      .single();

    if (error || !store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    const now = new Date();
    const trialEndDate = store.trial_end_date ? new Date(store.trial_end_date) : null;
    const subscriptionExpiresAt = store.subscription_expires_at ? new Date(store.subscription_expires_at) : null;

    const isPaidActive = !!store.subscription_active && (!subscriptionExpiresAt || subscriptionExpiresAt > now);
    const isInTrial = !store.subscription_active && !!trialEndDate && trialEndDate > now;
    const canAccess = isPaidActive || isInTrial;

    let daysRemaining = 0;
    if (isInTrial) {
      daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (isPaidActive && subscriptionExpiresAt) {
      daysRemaining = Math.max(0, Math.ceil((subscriptionExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    let subscriptionStatus = store.subscription_status;
    let subscriptionActive = store.subscription_active;

    // Assinatura paga venceu: desativa a loja de fato.
    if (store.subscription_active && subscriptionExpiresAt && subscriptionExpiresAt <= now) {
      await supabaseAdmin
        .from('stores')
        .update({ subscription_active: false, subscription_status: 'expired' })
        .eq('id', store.id);
      subscriptionActive = false;
      subscriptionStatus = 'expired';
    } else if (!store.subscription_active && trialEndDate && trialEndDate <= now && store.subscription_status !== 'expired') {
      // Trial venceu sem pagamento.
      await supabaseAdmin
        .from('stores')
        .update({ subscription_status: 'expired' })
        .eq('id', store.id);
      subscriptionStatus = 'expired';
    }

    return NextResponse.json({
      storeSlug: store.slug,
      subscriptionStatus,
      subscriptionActive,
      isInTrial,
      isPaidActive,
      canAccess,
      trialStartDate: store.trial_start_date,
      trialEndDate: store.trial_end_date,
      subscriptionExpiresAt: store.subscription_expires_at,
      daysRemaining,
      monthlyPrice: store.monthly_price,
    });

  } catch (err) {
    console.error('[Subscription Status]', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao verificar status de assinatura' },
      { status: 500 }
    );
  }
}
