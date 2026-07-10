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
      <section className="relative py-5 px-4 overflow-hidden text-center flex flex-col items-center justify-center">
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
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-8 inline-block px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm uppercase tracking-widest shadow-lg animate-pulse">
            🎉 OFERTA ESPECIAL: 1 MÊS 100% GRÁTIS!
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            Comece sem<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">Pagar Nada</span>
          </h2>
          
          <p className="text-xl mb-16 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Teste totalmente grátis durante 30 dias. Sem cartão de crédito. Sem compromisso.
            <br/>
            <strong style={{ color: 'var(--accent)' }}>Depois apenas R$ 20,00/mês</strong>
          </p>

          {/* Main Pricing Card */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="p-10 rounded-3xl border-2 shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
              {/* Animated gradient background */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full opacity-10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full opacity-10 blur-3xl" />
              
              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left side - Free Trial */}
                  <div className="text-left">
                    <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600" style={{ color: '#ffffff' }}>
                      <span className="font-black text-sm">✨ GRÁTIS POR 30 DIAS</span>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black mb-3 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                        R$ 0,00
                      </span>
                    </h3>
                    <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Período Completamente Grátis
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Acesso total a todos os recursos por 1 mês inteiro. Sem cartão de crédito solicitado.
                    </p>
                  </div>

                  {/* Right side - Then Price */}
                  <div className="text-left md:border-l md:pl-8" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="inline-block mb-4 px-4 py-2 rounded-full bg-[var(--bg-header)]">
                      <span className="font-black text-sm" style={{ color: 'var(--accent)' }}>DEPOIS DO TESTE</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black mb-3">
                      R$ 20,00
                      <span className="text-lg md:text-xl font-bold block" style={{ color: 'var(--text-secondary)' }}>por mês</span>
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Seu catálogo continua online. Cancele quando quiser, sem multa.
                    </p>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="mt-10 pt-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <span className="text-2xl mb-2 block">🎁</span>
                      <p className="font-bold">30 Dias Grátis</p>
                    </div>
                    <div>
                      <span className="text-2xl mb-2 block">📦</span>
                      <p className="font-bold">Produtos Ilimitados</p>
                    </div>
                    <div>
                      <span className="text-2xl mb-2 block">🔗</span>
                      <p className="font-bold">Link Próprio</p>
                    </div>
                    <div>
                      <span className="text-2xl mb-2 block">⚡</span>
                      <p className="font-bold">Pix Direto</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="w-full mt-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl text-white uppercase tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0891b2 100%)',
                    boxShadow: '0 20px 50px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  🚀 Ativar Meus 30 Dias Grátis Agora
                </button>
                
                <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                  ✓ Sem cartão de crédito
                  <span className="mx-2">•</span>
                  ✓ Cancele a qualquer momento
                  <span className="mx-2">•</span>
                  ✓ Sem compromisso
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof / Benefits */}
          <div className="max-w-2xl mx-auto bg-[var(--bg-header)] rounded-3xl p-8 border border-[var(--border-color)]">
            <h3 className="font-black text-xl mb-6" style={{ color: 'var(--text-primary)' }}>
              Seu 1º mês inclui tudo isso:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-sm">
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">🎁</span>
                <div>
                  <p className="font-bold">1 Mês Sem Pagar</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Acesso total, sem restrições</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">📦</span>
                <div>
                  <p className="font-bold">Catálogo Ilimitado</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Adicione quantos produtos quiser</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">🔗</span>
                <div>
                  <p className="font-bold">Link Próprio Exclusivo</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Compartilhe em qualquer rede social</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">⚡</span>
                <div>
                  <p className="font-bold">Pix com QR Code</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Gera automaticamente com valor da compra</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">💬</span>
                <div>
                  <p className="font-bold">WhatsApp Integrado</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Receba pedidos automaticamente</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">📊</span>
                <div>
                  <p className="font-bold">Painel Completo</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Gerencie produtos, categorias e pedidos</p>
                </div>
              </div>
            </div>
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
