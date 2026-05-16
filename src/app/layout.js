import { Geist } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "LJVision | Produtos Personalizados",
  description: "Coleção exclusiva de produtos personalizados: decoração, mascotes de times, colecionáveis, brinquedos e muito mais.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>

        {/* Navigation */}
        <header
          className="py-4 px-4 sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
            <Link href="/" className="text-2xl font-black tracking-tighter text-rose-500 hover:opacity-80 transition-opacity">
              LJVision
            </Link>

            <nav className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/"
                className="text-sm font-semibold transition-colors hidden sm:block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Catálogo
              </Link>
              <Link
                href="/placas-personalizadas"
                className="text-sm font-bold px-4 py-2 rounded-full transition-colors border"
                style={{
                  backgroundColor: 'rgba(244,63,94,0.08)',
                  color: '#e11d48',
                  borderColor: 'rgba(244,63,94,0.2)',
                }}
              >
                Personalizar ✨
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer
          className="border-t mt-16 py-8 text-center text-sm transition-colors duration-300"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <p>© 2025 <span className="font-bold text-rose-500">LJVision</span>. Todos os direitos reservados.</p>
          <p className="mt-1">Produtos personalizados feitos com cuidado e dedicação.</p>
        </footer>

      </body>
    </html>
  );
}
