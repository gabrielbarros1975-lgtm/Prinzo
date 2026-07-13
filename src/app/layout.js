import Script from 'next/script';
import { Sora, Manrope } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const siteUrl = 'https://www.prinzo.com.br';
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prinzo | Plataforma de Catálogos Digitais',
    template: '%s | Prinzo',
  },
  description:
    'Prinzo é uma plataforma para criar catálogos digitais, lojas online e recebimento via Pix e WhatsApp para negócios de impressão 3D e produtos personalizados.',
  keywords: [
    'Prinzo',
    'catálogo digital',
    'loja online',
    'vitrine de produtos',
    'sistema de loja',
    'pix',
    'whatsapp',
    'impressão 3D',
    'catálogo para loja',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prinzo | Plataforma de Catálogos Digitais',
    description:
      'Crie seu catálogo digital, compartilhe a loja e receba pedidos com Pix e WhatsApp sem complexidade.',
    url: siteUrl,
    siteName: 'Prinzo',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/prinzo_icon.svg',
        width: 512,
        height: 512,
        alt: 'Prinzo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prinzo | Plataforma de Catálogos Digitais',
    description:
      'Catálogo digital, loja online e atendimento com Pix e WhatsApp em uma plataforma moderna.',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Prinzo',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/prinzo_icon.svg',
    shortcut: '/prinzo_icon.svg',
    apple: '/prinzo_icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${manrope.variable} h-full`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAF9F6" />
        <link rel="icon" href="/prinzo_icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/prinzo_icon.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {measurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              strategy="beforeInteractive"
            />
            <Script id="ga-init" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${measurementId}', {
                  anonymize_ip: true,
                  send_page_view: true,
                });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
