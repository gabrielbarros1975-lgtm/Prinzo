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
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-4">Teste de Pagamentos Mercado Pago</h1>
        <p className="text-slate-400 mb-6">
          Use esta página para testar ambos os fluxos de produção:
          compra única e assinatura de plano.
        </p>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Pagamento único</h2>
          <p className="text-slate-400 mb-4">Este fluxo usa `/api/checkout` e deve funcionar como teste real de produção.</p>

          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <p className="font-semibold">Teste de pagamento real</p>
              <p className="text-xs text-slate-500">R$ 1,00</p>
            </div>
            <button
              type="button"
              onClick={handleTestPayment}
              disabled={loadingPayment}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-base font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPayment ? 'Redirecionando...' : 'Pagar R$ 1,00'}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Assinatura de plano</h2>
          <p className="text-slate-400 mb-4">
            Este fluxo usa `/api/subscription/checkout` e ativa o plano de assinatura em produção.
            Informe o `store_id` e `store_slug` da loja de teste.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <label className="block text-sm text-slate-300">
              store_id
              <input
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="ID da loja de teste"
              />
            </label>
            <label className="block text-sm text-slate-300">
              store_slug
              <input
                value={storeSlug}
                onChange={e => setStoreSlug(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="slug da loja de teste"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Assinatura de teste</p>
              <p className="text-xs text-slate-500">R$ 1,00</p>
            </div>
            <button
              type="button"
              onClick={handleTestSubscription}
              disabled={loadingSubscription}
              className="rounded-2xl bg-sky-500 px-5 py-3 text-base font-bold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          <p className="font-semibold text-slate-100 mb-2">Instruções</p>
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
