import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prinzo | Plataforma de Catálogos Digitais",
  description: "Crie seu catálogo personalizado, receba pedidos no WhatsApp e pagamentos via Pix direto sem intermediários.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved === 'dark' || (!saved && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
