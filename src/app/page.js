'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from "@/components/ThemeToggle";

const SUPPORT_WA = '5598984809302';
const SUPPORT_WA_LINK = `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent('Olá! Tenho interesse no Prinzo e gostaria de mais informações.')}`;

export default function SaaSLandingPage() {
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

          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-semibold transition-colors hover:text-[#00E5FF] text-slate-600 dark:text-slate-400"
            >
              Recursos
            </Link>
            <Link
              href="/admin"
              className="text-sm font-bold px-4 py-2 rounded-full transition-all border hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.1)] bg-slate-900 text-white dark:bg-white dark:text-black border-none"
            >
              Painel Administrativo 🔑
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden text-center flex flex-col items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, var(--logo-secondary) 0%, transparent 70%)' }}></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)] text-white shadow-lg shadow-cyan-500/20">
            Nova Era de Catálogos Digitais
          </span>
          <h1 className="text-5xl md:text-7xl font-black mt-6 mb-8 leading-tight tracking-tight text-slate-900 dark:text-white">
            Crie seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#0091FF]">Catálogo Digital</span> em minutos e venda no Pix
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Transforme suas vendas online. Tenha uma loja própria e configurável com link exclusivo, recebimento direto no seu WhatsApp e checkout via Pix automático sem intermediários.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="px-8 py-4 rounded-full font-extrabold text-white shadow-xl hover:scale-105 active:scale-98 transition-all text-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 10px 30px rgba(0,229,255,0.3)',
              }}
            >
              Criar Meu Catálogo Grátis 🚀
            </Link>
            <Link
              href="/ljvision"
              className="px-8 py-4 rounded-full font-bold border hover:bg-slate-100 dark:hover:bg-slate-900 text-center transition-all text-slate-800 dark:text-slate-200"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Ver Exemplo de Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16 text-slate-900 dark:text-white">
            Recursos Premium para Potencializar suas Vendas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-start">
              <span className="text-4xl mb-4">🔗</span>
              <h3 className="text-xl font-bold mb-2">Seu Link Próprio</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                URL personalizada e exclusiva para sua loja (ex: <code className="text-cyan-500">prinzo.com/sualoja</code>) para compartilhar no Instagram, TikTok e enviar para clientes.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-start">
              <span className="text-4xl mb-4">⚡</span>
              <h3 className="text-xl font-bold mb-2">Pix Direto Sem Taxas</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Configure sua chave Pix e gere QR Codes e códigos Copia e Cola dinâmicos automaticamente. O valor cai na hora na sua conta bancária sem tarifas ou intermediários.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-start">
              <span className="text-4xl mb-4">💬</span>
              <h3 className="text-xl font-bold mb-2">Vendas Integradas ao WhatsApp</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Os pedidos do carrinho e os comprovantes de pagamento do Pix são enviados formatados diretamente para o seu contato de WhatsApp para facilitar o atendimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white">
            Planos Simples e Transparentes
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-16">
            Comece grátis, configure tudo e ative seu plano quando estiver pronto para vender.
          </p>

          <div className="max-w-md mx-auto p-8 rounded-3xl border-2 border-cyan-500 bg-white dark:bg-slate-900 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500 text-white font-extrabold text-xs px-4 py-1.5 rounded-bl-2xl uppercase">
              Avaliação Gratuita
            </div>
            <span className="text-sm font-black uppercase text-cyan-500 tracking-wider">Assinatura Premium</span>
            <h3 className="text-4xl font-black mt-4 mb-2 text-slate-900 dark:text-white">
              R$ 9,90 <span className="text-sm font-normal text-slate-400">no 1º mês</span>
            </h3>
            <p className="text-xs text-slate-400 mb-2 font-bold">Depois apenas R$ 15,00/mês fixo!</p>
            <p className="text-[11px] text-slate-400 mb-8">Experimente grátis por 5 dias antes de ativar. Cancele quando quiser.</p>

            <ul className="text-left space-y-4 mb-8 text-sm text-slate-700 dark:text-slate-300">
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
