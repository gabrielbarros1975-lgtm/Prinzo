'use client';

import { useState } from 'react';

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTestPayment() {
    setError('');
    setLoading(true);

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
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-4">Teste de Pagamento Real</h1>
        <p className="text-slate-400 mb-6">
          Use esta página para gerar um pagamento real no Mercado Pago e verificar se a integração está funcionando.
          O valor do teste é R$ 1,00.
        </p>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Produto</span>
            <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Valor</span>
          </div>
          <div className="flex items-center justify-between py-4 border-t border-slate-800">
            <div>
              <p className="font-semibold">Teste de pagamento real</p>
              <p className="text-xs text-slate-500">Integração de produção Mercado Pago</p>
            </div>
            <span className="font-black text-white">R$ 1,00</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestPayment}
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-500 px-5 py-4 text-base font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Redirecionando para Mercado Pago...' : 'Pagar R$ 1,00 com Mercado Pago'}
        </button>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-500 bg-rose-950/20 px-4 py-3 text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          <p className="font-semibold text-slate-100 mb-2">Instruções</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Garanta que o `MP_ACCESS_TOKEN` de produção está configurado no Vercel.</li>
            <li>Use um pagamento real de produção para que o Mercado Pago confirme a integração.</li>
            <li>Se o webhook estiver ativo, o status será atualizado automaticamente.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
