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
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const setTheme = (dark) => {
                  document.documentElement.classList.toggle('dark', dark);
                };

                if (saved === 'dark' || saved === 'light') {
                  setTheme(saved === 'dark');
                } else {
                  setTheme(mediaQuery.matches);
                }

                if (!saved) {
                  const handleChange = (event) => setTheme(event.matches);
                  mediaQuery.addEventListener?.('change', handleChange);
                  mediaQuery.addListener?.(handleChange);
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
