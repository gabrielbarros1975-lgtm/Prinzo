'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false });

const SUPPORT_WA = '5598984809302';
const SUPPORT_WA_LINK = `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent('Olá! Tenho interesse no Prinzo e gostaria de mais informações.')}`;

const highlights = [
  'Cadastre peças em minutos',
  'Link pronto pro Instagram e WhatsApp',
  'Pix direto na sua conta, sem taxa',
];

const integrationItems = [
  { name: 'Pix', image: '/pix-logo.svg' },
  { name: 'Mercado Pago', image: '/mercado-pago-logo.webp' },
  { name: 'WhatsApp', image: '/whatsapp-logo.webp' },
];

const trustMarqueeItems = [
  { type: 'badge', label: 'Disponível como aplicativo' },
  ...integrationItems.map((item) => ({ type: 'logo', ...item })),
];

const pricingFeatures = [
  'Catálogo de produtos e categorias ilimitado',
  'Loja pública com link próprio para compartilhar',
  'Checkout com Pix e Mercado Pago',
  'Pedidos recebidos direto no WhatsApp',
  'Opção de usar como Totem Digital na loja física',
  'Sem comissão sobre suas vendas',
];

const faqs = [
  {
    question: 'Funciona no celular?',
    answer: 'Sim. Tanto o painel administrativo quanto a loja pública são responsivos, e o sistema pode ser instalado como aplicativo (PWA) no Android e no iOS.',
  },
  {
    question: 'Como eu recebo os pagamentos dos meus clientes?',
    answer: 'O pagamento cai direto na sua própria chave Pix ou na sua conta do Mercado Pago. O Prinzo não fica no meio da transação e não cobra comissão sobre suas vendas.',
  },
  {
    question: 'O que é o Totem Digital?',
    answer: 'É o mesmo catálogo rodando em modo vitrine, pensado para ficar em uma tela dentro da sua loja física. O cliente navega, escolhe o produto e envia o pedido sozinho.',
  },
  {
    question: 'O que acontece quando o teste grátis de 15 dias termina?',
    answer: 'A loja fica temporariamente inativa até você assinar o plano mensal. Nada é apagado: seus produtos, categorias e configurações continuam salvos.',
  },
  {
    question: 'Tem fidelidade ou multa de cancelamento?',
    answer: 'Não. Você pode cancelar quando quiser, sem multa e sem burocracia.',
  },
];

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

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function SaaSLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const showcaseTrackRef = useRef(null);

  const navLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#precos', label: 'Preços' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
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
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }}>
                {link.label}
              </Link>
            ))}
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
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block rounded-2xl px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }} onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <Link href="/admin" className="block rounded-2xl px-4 py-3 text-sm font-bold" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)' }} onClick={() => setMobileMenuOpen(false)}>
                  Entrar no painel
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="flex min-w-0 flex-col gap-6">
              <h1 className="max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
                Sua loja de peças 3D, pronta em minutos.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                Monte seu catálogo, receba pedidos pelo WhatsApp e o pagamento cai direto no seu Pix. Sem comissão, sem intermediário. O sistema também pode ser exibido como totem digital na loja ou instalado como aplicativo no Android e iOS.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/admin" className="rounded-full px-8 py-4 text-center text-sm font-bold" style={{ backgroundColor: 'var(--navy)', color: '#fff' }}>
                  Criar minha loja grátis
                </Link>
                <Link href="/ljvision" className="rounded-full border px-8 py-4 text-center text-sm font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  Ver catálogo de exemplo
                </Link>
              </div>

              <div
                className="relative overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                }}
              >
                <div className="flex w-max animate-marquee items-center gap-8">
                  {[...trustMarqueeItems, ...trustMarqueeItems].map((item, index) => (
                    <div key={`${item.type}-${item.name || item.label}-${index}`} className="flex shrink-0 items-center">
                      {item.type === 'badge' ? (
                        <span className="whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                          {item.label}
                        </span>
                      ) : (
                        <Image src={item.image} alt={item.name} width={90} height={30} className="h-6 w-auto object-contain opacity-80" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {highlights.map((item, index) => (
                  <span key={item} className="flex items-center gap-3">
                    {item}
                    {index < highlights.length - 1 && (
                      <span aria-hidden="true" className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--border-color)' }} />
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-w-0 w-full h-[240px] sm:h-[300px] lg:h-[420px] overflow-hidden">
              <Hero3D />
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="px-4 py-16 md:py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>O sistema por dentro</h2>
            <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>Prints reais do painel, da loja pública e do checkout, do jeito que ficam pro seu cliente.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => showcaseTrackRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
              className="h-9 w-9 rounded-full border text-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => showcaseTrackRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
              className="h-9 w-9 rounded-full border text-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              ›
            </button>
          </div>

          <div ref={showcaseTrackRef} className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              {
                title: 'Admin · produtos',
                subtitle: 'Nome, fotos, cor e preço em menos de um minuto',
                image: '/paineladmin.webp',
              },
              {
                title: 'Loja pública',
                subtitle: 'Organizada por categoria, funciona bem no celular',
                image: '/loja-pub.webp',
              },
              {
                title: 'Checkout',
                subtitle: 'Fluxo de pedido e pagamento',
                image: '/chekout.webp',
              },
              {
                title: 'Formas de pagamento',
                subtitle: 'Cliente escolhe Pix ou Mercado Pago',
                image: '/pagamento.webp',
              },
              {
                title: 'Totem digital',
                subtitle: 'Exposição em pontos de venda e vitrine interativa',
                image: '/totemdigital.png',
              },
            ].map((item) => (
              <article key={item.title} className="w-[min(100%,300px)] shrink-0 rounded-2xl border transition-shadow hover:shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="overflow-hidden bg-[var(--card)]" style={{ aspectRatio: '16 / 10' }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={1200}
                    height={750}
                    className="block h-full w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
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

      <section className="px-4 py-20" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1.4fr_1fr] items-center">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] font-bold mb-4" style={{ color: 'var(--accent)' }}>
              Totem Digital
            </p>
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Use o Prinzo como vitrine interativa na sua loja.
            </h2>
            <p className="mt-4 text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Apresente produtos, preços e opções de pedido em um painel digital no ponto de venda. O cliente navega, escolhe e envia pedido direto pelo WhatsApp ou Pix, sem precisar de atendimento extra.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Autoatendimento</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Deixe o cliente explorar os produtos sozinho no totem.</p>
              </div>
              <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Sem tela de espera</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>O mesmo catálogo do celular, só que numa tela maior na sua loja.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
            <Image
              src="/totemdigital.png"
              alt="Totem digital do Prinzo em loja"
              width={1200}
              height={900}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>Três etapas, sem passo escondido</h2>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            {/* Alinhado ao centro dos círculos: com 3 colunas iguais e gap-6 (24px),
                metade da largura de cada coluna é exatamente 100%/6 - 8px. */}
            <div
              aria-hidden="true"
              className="absolute hidden md:block"
              style={{ top: '18px', left: 'calc(100%/6 - 8px)', right: 'calc(100%/6 - 8px)', height: '2px', backgroundColor: 'var(--border-color)' }}
            />
            {[
              { title: 'Crie sua loja', description: 'Nome, link e dados de contato. Menos de dois minutos.' },
              { title: 'Adicione suas peças', description: 'Categoria, cor de filamento e preço, uma por uma ou em lote.' },
              { title: 'Receba pedidos', description: 'O cliente escolhe no catálogo, você combina produção e entrega pelo WhatsApp.' },
            ].map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center md:px-4">
                <div
                  className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: 'var(--navy)', color: '#fff' }}
                >
                  {index + 1}
                </div>
                <h3 className="mt-4 text-xl" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>Um plano simples</h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>Teste de verdade antes de pagar qualquer coisa. Sem cartão de crédito para começar.</p>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-3xl border p-8 text-center shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
            15 dias grátis
          </span>
          <div className="mt-6 flex items-end justify-center gap-1">
            <span className="text-5xl font-black" style={{ color: 'var(--text-primary)' }}>R$ 19,90</span>
            <span className="pb-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>/mês</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>depois do período de teste</p>

          <ul className="mt-8 flex flex-col gap-3 text-left">
            {pricingFeatures.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <Link href="/admin" className="mt-8 block rounded-full px-8 py-4 text-center text-sm font-bold" style={{ backgroundColor: 'var(--navy)', color: '#fff' }}>
            Começar grátis por 15 dias
          </Link>
        </div>
      </section>

      <section className="px-4 py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>Perguntas frequentes</h2>
            <p className="mt-4 text-base" style={{ color: 'var(--text-secondary)' }}>O que a maioria pergunta antes de criar a loja.</p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold"
                    style={{ color: 'var(--text-primary)' }}
                    aria-expanded={isOpen}
                  >
                    {faq.question}
                    <span className="shrink-0 text-xl" style={{ color: 'var(--text-muted)' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20" style={{ backgroundColor: 'var(--navy-2)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--bg)' }}>Tudo pronto para começar a vender</h2>
            <p className="mt-3 text-base" style={{ color: '#c8d0dc' }}>Crie sua loja gratuitamente, organize seu catálogo e compartilhe com seus clientes em poucos minutos.</p>
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

      <footer className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>© 2026 <span className="font-bold" style={{ color: 'var(--accent)' }}>Prinzo</span>. Todos os direitos reservados.</span>
          <nav className="flex flex-wrap gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
    </>
  );
}
