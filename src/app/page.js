'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from "@/components/ThemeToggle";

const SUPPORT_WA = '5598984809302';
const SUPPORT_WA_LINK = `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent('Olá! Tenho interesse no Prinzo e gostaria de mais informações.')}`;

export default function SaaSLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <header
        className="py-4 px-4 sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <Link href="/" className="text-2xl font-black tracking-tighter group flex items-center">
            <span className="bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]">
              Prinzo
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-semibold transition-colors hover:text-[#00E5FF]" style={{ color: 'var(--text-secondary)' }}
            >
              Recursos
            </Link>
            <Link
              href="/admin"
              className="text-sm font-bold px-4 py-2 rounded-full transition-all border hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.1)] border-none" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)' }}
            >
              Painel Administrativo 🔑
            </Link>
            <ThemeToggle />
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="sm:hidden inline-flex items-center justify-center rounded-xl border bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm p-3 border-[var(--border-color)] dark:bg-[var(--bg-card)] dark:text-[var(--text-primary)] dark:border-[var(--border-color)]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <span className="sr-only">{mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 rounded-full bg-[var(--text-primary)]" />
              <span className="block h-0.5 w-6 rounded-full bg-[var(--text-primary)]" />
              <span className="block h-0.5 w-6 rounded-full bg-[var(--text-primary)]" />
            </div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 rounded-3xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col gap-3">
              <Link
                href="/admin"
                className="block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors text-[var(--text-primary)] hover:bg-[var(--bg-header)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-header)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link
                href="/admin"
                className="block rounded-2xl px-4 py-3 text-sm font-bold transition-all bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-header)] dark:bg-[var(--bg-card)] dark:text-[var(--text-primary)] dark:border-[var(--border-color)] dark:hover:bg-[var(--bg-header)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Painel Administrativo 🔑
              </Link>
              <div className="rounded-2xl px-4 py-3 bg-[var(--bg-card)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden text-center flex flex-col items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, var(--logo-secondary) 0%, transparent 70%)' }}></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)] shadow-lg shadow-cyan-500/20" style={{ color: '#ffffff' }}>
            Nova Era de Catálogos Digitais
          </span>
          <h1 className="text-5xl md:text-7xl font-black mt-6 mb-8 leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Crie seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#0091FF]">Catálogo Digital</span> em minutos e venda no Pix
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
            Transforme suas vendas online. Tenha uma loja própria e configurável com link exclusivo, recebimento direto no seu WhatsApp e checkout via Pix automático sem intermediários.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="px-8 py-4 rounded-full font-extrabold shadow-xl hover:scale-105 active:scale-98 transition-all text-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                color: '#ffffff',
                boxShadow: '0 10px 30px rgba(0,229,255,0.3)',
              }}
            >
              Criar Meu Catálogo Grátis 🚀
            </Link>
            <Link
              href="/ljvision"
              className="px-8 py-4 rounded-full font-bold border text-center transition-all"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              Ver Exemplo de Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[var(--bg-header)] border-t border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16" style={{ color: 'var(--text-primary)' }}>
            Recursos Premium para Potencializar suas Vendas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col items-start">
              <span className="text-4xl mb-4">🔗</span>
              <h3 className="text-xl font-bold mb-2">Seu Link Próprio</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                URL personalizada e exclusiva para sua loja (ex: <code className="text-cyan-500">prinzo.com/sualoja</code>) para compartilhar no Instagram, TikTok e enviar para clientes.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col items-start">
              <span className="text-4xl mb-4">⚡</span>
              <h3 className="text-xl font-bold mb-2">Pix Direto Sem Taxas</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Configure sua chave Pix e gere QR Codes e códigos Copia e Cola dinâmicos automaticamente. O valor cai na hora na sua conta bancária sem tarifas ou intermediários.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col items-start">
              <span className="text-4xl mb-4">💬</span>
              <h3 className="text-xl font-bold mb-2">Vendas Integradas ao WhatsApp</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Os pedidos do carrinho e os comprovantes de pagamento do Pix são enviados formatados diretamente para o seu contato de WhatsApp para facilitar o atendimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Assinatura Premium
          </h2>
          <p className="mb-16" style={{ color: 'var(--text-secondary)' }}>
            R$ 9,90 no 1º mês. Depois apenas R$ 15,00/mês fixo.
          </p>

          <div className="max-w-md mx-auto p-8 rounded-3xl border-2 shadow-xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
            <div className="absolute top-0 right-0 font-extrabold text-xs px-4 py-1.5 rounded-bl-2xl uppercase" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>
              Avaliação Gratuita
            </div>
            <span className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Assinatura Premium</span>
            <h3 className="text-4xl font-black mt-4 mb-2 text-[var(--text-primary)]">
              R$ 15,00 <span className="text-sm font-normal text-[var(--text-muted)]">/mês fixo</span>
            </h3>
            <p className="text-[11px] mb-8" style={{ color: 'var(--text-muted)' }}>Experimente grátis por 5 dias antes de ativar. Cancele quando quiser.</p>

            <ul className="text-left space-y-4 mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-center gap-2">✓ <strong>5 Dias de Teste Grátis</strong> (liberação imediata)</li>
              <li className="flex items-center gap-2">✓ <strong>Catálogo Ilimitado</strong> de Produtos</li>
              <li className="flex items-center gap-2">✓ Painel administrativo completo</li>
              <li className="flex items-center gap-2">✓ Recebimento de pedidos no WhatsApp</li>
              <li className="flex items-center gap-2">✓ Configuração de Pix Direto com QR Code</li>
              <li className="flex items-center gap-2">✓ Link próprio exclusivo</li>
              <li className="flex items-center gap-2">
                ✓ <a href={SUPPORT_WA_LINK} target="_blank" rel="noopener noreferrer" className="text-green-500 font-bold hover:underline">Suporte premium via WhatsApp 💬</a>
              </li>
            </ul>

            <Link
              href="/admin"
              className="block w-full py-4 rounded-xl font-bold bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-colors"
            >
              Criar Minha Loja Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t mt-auto py-8 text-center text-sm transition-colors duration-300"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
      >
        <p>© 2026 <span className="font-bold text-cyan-500">Prinzo</span>. Todos os direitos reservados.</p>
        <p className="mt-1">Crie sua loja de catálogo em minutos com Pix e WhatsApp.</p>
        <p className="mt-3">
          <a
            href={SUPPORT_WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-500 font-bold hover:underline text-sm"
          >
            💬 Falar com Suporte via WhatsApp
          </a>
        </p>
      </footer>
    </main>
  );
}
