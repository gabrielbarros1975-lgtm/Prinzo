'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, use } from 'react';

const STATUS_CONFIG = {
  approved: {
    emoji: '✅',
    title: 'Pagamento Aprovado!',
    message: 'Seu pedido foi confirmado com sucesso. Clique abaixo para notificar o vendedor via WhatsApp.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
  },
  pending: {
    emoji: '⏳',
    title: 'Pagamento em Análise',
    message: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
  failure: {
    emoji: '❌',
    title: 'Pagamento Não Aprovado',
    message: 'Não foi possível processar seu pagamento. Tente novamente ou escolha outra forma de pagamento.',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
  },
};

function PaymentContent({ storeSlug }) {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const [lastCart, setLastCart] = useState([]);
  const [paymentId, setPaymentId] = useState('');
  const [store, setStore] = useState(null);

  useEffect(() => {
    const cartData = localStorage.getItem('ljvision_last_cart');
    if (cartData) {
      try { setLastCart(JSON.parse(cartData)); } catch (e) {}
    }
    const pid = searchParams.get('payment_id') || searchParams.get('collection_id');
    if (pid) setPaymentId(pid);
  }, [searchParams]);

  useEffect(() => {
    if (!storeSlug) return;
    fetch(`/api/stores?slug=${storeSlug}`)
      .then(res => res.json())
      .then(data => { if (!data.error) setStore(data); })
      .catch(() => {});
  }, [storeSlug]);

  const whatsappNumber = store?.whatsapp_number || '5598984809302';

  const handleNotifyWA = () => {
    const totalPrice = lastCart.reduce((acc, p) => acc + p.price * p.qty, 0);
    const lines = lastCart.map(p => {
      const customText = p.customName ? ` (Base: ${p.customName})` : '';
      return `• ${p.name}${customText} (×${p.qty})`;
    });

    const storeName = store?.name || 'a loja';
    const msg = `Olá! Realizei o pagamento do meu pedido em *${storeName}* via Mercado Pago!\n\n` +
      `*ID do Pagamento:* ${paymentId || 'N/A'}\n` +
      `*Valor Total:* R$ ${totalPrice.toFixed(2).replace('.', ',')}\n\n` +
      `*Itens do Pedido:*\n${lines.join('\n')}\n\n` +
      `Pode confirmar o recebimento e me passar os detalhes da entrega?`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const catalogHref = storeSlug ? `/${storeSlug}` : '/';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--bg-page, #0a0a0f)',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          borderRadius: '1.5rem',
          border: `1px solid ${config.border}`,
          backgroundColor: config.bg,
          padding: '2.5rem 2rem',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>{config.emoji}</div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: config.color }}>
          {config.title}
        </h1>

        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary, #94a3b8)', marginBottom: '1.5rem' }}>
          {config.message}
        </p>

        {status === 'approved' && lastCart.length > 0 && (
          <div style={{
            textAlign: 'left',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '1rem',
            padding: '1.25rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              Resumo do Pedido
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
              {lastCart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    {item.name} {item.customName ? `(Base: ${item.customName})` : ''}
                  </span>
                  <span>{item.qty}x — R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
            {paymentId && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                Mercado Pago ID: <code style={{ color: 'var(--accent, #00e5ff)' }}>{paymentId}</code>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {status === 'approved' && lastCart.length > 0 && (
            <button
              onClick={handleNotifyWA}
              style={{
                display: 'block', width: '100%', padding: '0.85rem 1.5rem',
                borderRadius: '0.875rem', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', border: 'none', color: '#fff',
                background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                boxShadow: '0 5px 20px rgba(37,211,102,0.3)',
              }}
            >
              🟢 Confirmar no WhatsApp
            </button>
          )}

          <a
            href={catalogHref}
            style={{
              display: 'block', padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
              color: '#fff',
              background: 'linear-gradient(135deg, var(--accent, #00e5ff), var(--accent-hover, #0091ff))',
              boxShadow: '0 5px 20px rgba(0,229,255,0.25)',
            }}
          >
            Voltar ao Catálogo
          </a>

          {status === 'failure' && (
            <a
              href={catalogHref}
              style={{
                display: 'block', padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
                fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                color: 'var(--text-secondary, #94a3b8)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              }}
            >
              Tentar Novamente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PagamentoPage({ params }) {
  const unwrappedParams = use(params);
  const storeSlug = unwrappedParams?.storeSlug;

  return (
    <Suspense>
      <PaymentContent storeSlug={storeSlug} />
    </Suspense>
  );
}
