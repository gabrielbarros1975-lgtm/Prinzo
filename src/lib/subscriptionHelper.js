/**
 * Hook customizado para verificar status de assinatura
 */
export async function checkSubscriptionStatus(storeSlug) {
  try {
    const response = await fetch(`/api/subscription/status?slug=${storeSlug}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar status de assinatura');
    }
    return await response.json();
  } catch (error) {
    console.error('[useSubscription]', error);
    return null;
  }
}

/**
 * Calcula dias restantes do período de teste
 */
export function calculateTrialDaysRemaining(trialEndDate) {
  if (!trialEndDate) return 0;
  const now = new Date();
  const end = new Date(trialEndDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formata data em formato brasileiro
 */
export function formatDateBR(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata preço em reais
 */
export function formatPriceBRL(price) {
  if (typeof price === 'number') {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }
  return 'R$ 0,00';
}
