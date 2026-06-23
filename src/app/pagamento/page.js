'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const STATUS_CONFIG = {
  approved: {
    emoji: '✅',
    title: 'Pagamento Aprovado!',
    message: 'Seu pedido foi confirmado com sucesso. Entraremos em contato em breve para combinar a entrega.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
  },
  pending: {
    emoji: '⏳',
    title: 'Pagamento em Análise',
    message: 'Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.',
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

function PaymentContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

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
        {/* Emoji */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>
          {config.emoji}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '0.75rem',
            color: config.color,
          }}
        >
          {config.title}
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary, #94a3b8)',
            marginBottom: '2rem',
          }}
        >
          {config.message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="/"
            style={{
              display: 'block',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.875rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              color: '#fff',
              background: 'linear-gradient(135deg, var(--accent, #00e5ff), var(--accent-hover, #0091ff))',
              boxShadow: '0 5px 20px rgba(0,229,255,0.25)',
              transition: 'opacity 0.2s',
            }}
          >
            Voltar ao Catálogo
          </a>

          {status === 'failure' && (
            <a
              href="/"
              style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.875rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                color: 'var(--text-secondary, #94a3b8)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                transition: 'opacity 0.2s',
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

export default function PagamentoPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
