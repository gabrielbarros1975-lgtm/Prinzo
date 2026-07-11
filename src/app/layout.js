import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Prinzo | Plataforma de Catálogos Digitais',
  description: 'Crie seu catálogo personalizado, receba pedidos no WhatsApp e pagamentos via Pix direto sem intermediários.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAF9F6" />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
