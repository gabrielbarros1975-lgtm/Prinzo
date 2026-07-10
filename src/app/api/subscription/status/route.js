import { supabase } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

/**
 * GET /api/subscription/status?slug=store-slug
 * Verifica o status de assinatura/trial da loja
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

    const { data: store, error } = await supabase
      .from('stores')
      .select('id, slug, subscription_status, trial_start_date, trial_end_date, subscription_active, monthly_price')
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
    const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const status = {
      storeSlug: store.slug,
      subscriptionStatus: store.subscription_status,
      isInTrial: store.subscription_status === 'trial' && trialEndDate && trialEndDate > now,
      isActive: store.subscription_status === 'active' && store.subscription_active,
      trialStartDate: store.trial_start_date,
      trialEndDate: store.trial_end_date,
      daysRemaining: Math.max(0, daysRemaining),
      monthlyPrice: store.monthly_price,
      canAccess: (store.subscription_status === 'trial' && trialEndDate && trialEndDate > now) || (store.subscription_status === 'active' && store.subscription_active),
    };

    // Se o trial expirou, atualizar o status
    if (store.subscription_status === 'trial' && trialEndDate && trialEndDate <= now) {
      await supabase
        .from('stores')
        .update({ subscription_status: 'expired' })
        .eq('id', store.id);
      
      status.subscriptionStatus = 'expired';
      status.canAccess = false;
    }

    return NextResponse.json(status);

  } catch (err) {
    console.error('[Subscription Status]', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao verificar status de assinatura' },
      { status: 500 }
    );
  }
}
