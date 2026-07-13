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

export const metadata = {
  title: 'Prinzo | Plataforma de Catálogos Digitais',
  description: 'Crie seu catálogo personalizado, receba pedidos no WhatsApp e pagamentos via Pix direto sem intermediários.',
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
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
