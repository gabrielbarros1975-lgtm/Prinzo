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
            <Link href="/" className="text-2xl font-black tracking-tighter group flex items-center">
              <span className="bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,229,255,0.2)] dark:drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                LJ
              </span>
              <span className="ml-0.5 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--logo-text)' }}>
                Vision
              </span>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/"
                className="text-sm font-semibold transition-colors hidden sm:block hover:text-[#00E5FF]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Catálogo
              </Link>
              <Link
                href="/placas-personalizadas"
                className="text-sm font-bold px-4 py-2 rounded-full transition-all border hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                style={{
                  backgroundColor: 'rgba(0,229,255,0.05)',
                  color: 'var(--accent)',
                  borderColor: 'rgba(0,229,255,0.2)',
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
