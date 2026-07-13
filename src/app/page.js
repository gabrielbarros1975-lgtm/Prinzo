'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SUPPORT_WA = '5598984809302';
const SUPPORT_WA_LINK = `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent('Olá! Tenho interesse no Prinzo e gostaria de mais informações.')}`;

const highlights = [
  { value: 'Cadastre em minutos', label: 'Peças, cores e preços' },
  { value: 'Loja pronta pra compartilhar', label: 'Link no Instagram e WhatsApp' },
  { value: 'Pix sem taxa de terceiros', label: 'Cliente paga, você recebe' },
];

const features = [
  {
    title: 'Administração central',
    description: 'Cadastre produtos, categorias, preços e conteúdo em um painel organizado para operar o negócio de forma clara.',
  },
  {
    title: 'Loja pública',
    description: 'A vitrine do catálogo fica pronta para apresentar itens de forma profissional e com navegação simples para o cliente.',
  },
  {
    title: 'Fluxo de pedido',
    description: 'O cliente visualiza o catálogo, escolhe o item e segue para o pagamento ou para o atendimento com menos atrito.',
  },
];

const integrationItems = ['Pix', 'Mercado Pago', 'WhatsApp'];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Prinzo',
  url: 'https://www.prinzo.com.br',
  description:
    'Plataforma para catálogos digitais, vitrine online e pedidos com Pix e WhatsApp.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.prinzo.com.br/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function SaaSLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <Image src="/prinzo_icon.svg" alt="Prinzo" width={28} height={28} className="shrink-0" />
            <span className="font-display text-[var(--logo-primary)]">Prinzo</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#recursos" className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Recursos
            </Link>
            <Link href="#como-funciona" className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Como funciona
            </Link>
            <Link href="/admin" className="rounded-full border px-4 py-2 text-sm font-bold transition-all" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)', borderColor: 'var(--text-primary)' }}>
              Entrar no painel
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl border p-3 md:hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <span className="sr-only">{mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
              <span className="block h-0.5 w-6 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
              <span className="block h-0.5 w-6 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
            </div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mx-auto max-w-6xl px-4 pb-4 md:hidden">
            <div className="rounded-3xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex flex-col gap-3">
                <Link href="#recursos" className="block rounded-2xl px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }} onClick={() => setMobileMenuOpen(false)}>
                  Recursos
                </Link>
                <Link href="#como-funciona" className="block rounded-2xl px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }} onClick={() => setMobileMenuOpen(false)}>
                  Como funciona
                </Link>
                <Link href="/admin" className="block rounded-2xl px-4 py-3 text-sm font-bold" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)' }} onClick={() => setMobileMenuOpen(false)}>
                  Entrar no painel
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
              Sua loja de peças 3D, pronta em minutos.
            </h1>

            <p className="max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Monte seu catálogo, receba pedidos pelo WhatsApp e o pagamento cai direto no seu Pix. Sem comissão, sem intermediário.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/admin" className="rounded-full px-8 py-4 text-center text-sm font-bold" style={{ backgroundColor: 'var(--navy)', color: '#fff' }}>
                Criar minha loja grátis
              </Link>
              <Link href="/ljvision" className="rounded-full border px-8 py-4 text-center text-sm font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                Ver catálogo de exemplo
              </Link>
            </div>

            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.value} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>Telas do sistema</h2>
            <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>Blocos prontos para receber os prints de cada parte do produto em uma apresentação enxuta.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => document.getElementById('showcaseTrack')?.scrollBy({ left: -320, behavior: 'smooth' })}
              className="h-9 w-9 rounded-full border text-lg"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => document.getElementById('showcaseTrack')?.scrollBy({ left: 320, behavior: 'smooth' })}
              className="h-9 w-9 rounded-full border text-lg"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              ›
            </button>
          </div>

          <div id="showcaseTrack" className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { title: 'Admin · produtos', subtitle: 'Cadastro e gestão de catálogo' },
              { title: 'Loja pública', subtitle: 'Visual do catálogo para clientes' },
              { title: 'Checkout', subtitle: 'Fluxo de pedido e pagamento' },
              { title: 'WhatsApp + pedidos', subtitle: 'Atendimento e confirmação' },
            ].map((item) => (
              <article key={item.title} className="w-[300px] shrink-0 overflow-hidden rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="flex h-[220px] items-center justify-center bg-[var(--card)] text-xs" style={{ color: 'var(--text-muted)' }}>
                  print da tela
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>O fluxo do sistema em uma só narrativa</h2>
            <p className="mt-4 text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>Do painel administrativo até a loja pública e o checkout, a experiência fica clara e pronta para ser exibida em apresentação.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className="rounded-3xl border p-7" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <p className="text-[13px] font-bold" style={{ color: 'var(--gold)' }}>{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-4 text-xl" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>Conectado ao que seu cliente já usa e confia</h2>
            <p className="mt-4 text-base" style={{ color: 'var(--text-secondary)' }}>Recebimento e atendimento rodando nos sistemas que seu comprador já conhece.</p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border" style={{ backgroundColor: 'var(--border-color)', borderColor: 'var(--border-color)' }}>
            {integrationItems.map((item) => (
              <div key={item} className="flex min-h-24 items-center justify-center px-6 py-8 text-sm font-bold" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>Do cadastro ao primeiro pedido</h2>
            <p className="mt-4 text-base" style={{ color: 'var(--text-secondary)' }}>Três etapas, nessa ordem, sem passos escondidos.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { number: '1', title: 'Crie sua loja', description: 'Cadastre nome, link e dados de contato.' },
              { number: '2', title: 'Adicione suas peças', description: 'Organize por categoria, cores de filamento e preço em minutos.' },
              { number: '3', title: 'Receba pedidos', description: 'O cliente escolhe pelo catálogo e você combina impressão e entrega pelo WhatsApp.' },
            ].map((step) => (
              <article key={step.number} className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <p className="text-5xl leading-none" style={{ color: 'var(--navy)' }}>{step.number}</p>
                <h3 className="mt-4 text-xl" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20" style={{ backgroundColor: 'var(--navy-2)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--bg)' }}>Interface profissional para apresentar o sistema.</h2>
            <p className="mt-3 text-base" style={{ color: '#c8d0dc' }}>Use essa landing como base para um deck de produto, com os prints das telas do painel, catálogo e checkout já organizados visualmente.</p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3 md:items-end">
            <Link href="/admin" className="rounded-full px-8 py-4 text-center text-sm font-bold" style={{ backgroundColor: 'var(--bg)', color: 'var(--navy)' }}>
              Abrir sistema
            </Link>
            <a href={SUPPORT_WA_LINK} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-8 py-4 text-center text-sm font-bold" style={{ color: 'var(--bg)' }}>
              Falar com suporte
            </a>
          </div>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <div className="mx-auto max-w-6xl flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <span>© 2026 <span className="font-bold" style={{ color: 'var(--accent)' }}>Prinzo</span>. Todos os direitos reservados.</span>
          <span>Catálogo para vender impressão 3D, com Pix e WhatsApp.</span>
        </div>
      </footer>
    </main>
    </>
  );
}
