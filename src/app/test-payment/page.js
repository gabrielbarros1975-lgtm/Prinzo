'use client';

import { useState } from 'react';

export default function TestPaymentPage() {
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [error, setError] = useState('');
  const [storeId, setStoreId] = useState('');
  const [storeSlug, setStoreSlug] = useState('');

  async function handleTestPayment() {
    setError('');
    setLoadingPayment(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: 'real-payment-test',
              name: 'Teste de pagamento real',
              qty: 1,
              price: 1.0,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao iniciar pagamento');
      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message || 'Erro inesperado ao iniciar o pagamento');
    } finally {
      setLoadingPayment(false);
    }
  }

  async function handleTestSubscription() {
    setError('');
    setLoadingSubscription(true);

    if (!storeId || !storeSlug) {
      setError('Informe o store_id e o store_slug para testar a assinatura.');
      setLoadingSubscription(false);
      return;
    }

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, store_slug: storeSlug }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao iniciar checkout de assinatura');
      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message || 'Erro inesperado ao iniciar o checkout de assinatura');
    } finally {
      setLoadingSubscription(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="mx-auto max-w-4xl rounded-3xl border p-8 shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h1 className="text-3xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Teste de Pagamentos Mercado Pago</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Use esta página para testar ambos os fluxos de produção:
          compra única e assinatura de plano.
        </p>

        <section className="rounded-3xl border p-6 mb-8" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Pagamento único</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Este fluxo usa `/api/checkout` e deve funcionar como teste real de produção.</p>

          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Teste de pagamento real</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>R$ 1,00</p>
            </div>
            <button
              type="button"
              onClick={handleTestPayment}
              disabled={loadingPayment}
              className="rounded-2xl px-5 py-3 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-page)' }}
            >
              {loadingPayment ? 'Redirecionando...' : 'Pagar R$ 1,00'}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border p-6 mb-8" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Assinatura de plano</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Este fluxo usa `/api/subscription/checkout` e ativa o plano de assinatura em produção.
            Informe o `store_id` e `store_slug` da loja de teste.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <label className="block text-sm" style={{ color: 'var(--text-secondary)' }}>
              store_id
              <input
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="ID da loja de teste"
              />
            </label>
            <label className="block text-sm" style={{ color: 'var(--text-secondary)' }}>
              store_slug
              <input
                value={storeSlug}
                onChange={e => setStoreSlug(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="slug da loja de teste"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Assinatura de teste</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>R$ 1,00</p>
            </div>
            <button
              type="button"
              onClick={handleTestSubscription}
              disabled={loadingSubscription}
              className="rounded-2xl px-5 py-3 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-page)' }}
            >
              {loadingSubscription ? 'Redirecionando...' : 'Ativar assinatura por R$ 1,00'}
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-500 bg-rose-950/20 px-4 py-3 text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border p-4 text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Instruções</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>O `MP_ACCESS_TOKEN` de produção deve estar configurado no Vercel.</li>
            <li>O `MP_WEBHOOK_SIGNATURE` deve estar configurado no Vercel para Webhooks.</li>
            <li>Use o ID e slug da loja de teste para simular o plano no admin.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
