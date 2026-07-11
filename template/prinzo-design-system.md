# Prinzo — Design System

## 1. Avaliação da paleta

Sim, mantenha esta paleta — e o motivo importa mais que a cor em si.

O Prinzo processa pagamento (Pix, Mercado Pago) pra um público que ainda desconfia de "plataforma nova". Navy + off-white é o par que fintechs sérias usam (Itaú, Stripe, C6) exatamente pra neutralizar essa desconfiança. Um público maker pode parecer que pede algo mais "vibrante", mas vibrante é o que toda ferramenta de IA genérica já usa (roxo/azul-gradiente). Aqui o diferencial competitivo é parecer **sério o suficiente pra alguém confiar o Pix**, não parecer divertido.

O verde (accent) já cumpre o papel de trazer identidade/energia — é o único ponto de cor viva na página, e não por acaso é a cor do Pix. Não precisa de uma segunda cor "para não ficar sério demais".

## 2. Paleta de cores

| Token | Hex | Onde usar |
|---|---|---|
| `--navy` | `#132A46` | Texto principal, headlines, botão primário, logo |
| `--navy-2` | `#0B1D33` | Hover do botão primário, fundo da faixa de CTA final, footer escuro (se usar) |
| `--bg` | `#FAF9F6` | Fundo geral da página (off-white, nunca branco puro) |
| `--card` | `#F3F1EA` | Fundo de seções alternadas ("Como funciona", "Integrações") |
| `--border` | `#E2DFD5` | Bordas, divisores, grid lines |
| `--text-secondary` | `#5B6472` | Parágrafos, subtítulos |
| `--text-muted` | `#8A93A0` | Legendas pequenas, metadados |
| `--accent` | `#0F6E56` | Cor viva única — eyebrow, status, elementos ligados a Pix/confirmação |
| `--accent-bg` | `#E1F5EE` | Fundo claro por trás do accent (badges, chips) |
| `--gold` | `#9C7A3C` | Detalhe pontual — numeração das features, nunca em área grande |

**Regra:** navy e off-white cobrem ~90% da página. Verde aparece só em pontos de destaque (nunca em blocos grandes). Dourado é usado no máximo 3x na página inteira. Zero gradiente.

## 3. Tipografia

| Fonte | Uso | Pesos usados |
|---|---|---|
| **Fraunces** (serif) | `h1`, `h2`, `h3`, preços, números fantasma do "como funciona" | 400, 500, 600 |
| **Inter** (sans) | Corpo de texto, botões, nav, labels | 400, 500, 600 |

A serifada só entra em título/número — nunca em parágrafo. É isso que dá o ar "editorial/institucional" sem parecer meme de fonte serifada em tudo.

### Setup no Next.js (`app/layout.tsx`)

```tsx
import { Fraunces, Inter } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

## 4. Tailwind config

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#132A46', dark: '#0B1D33' },
        bg: '#FAF9F6',
        card: '#F3F1EA',
        border: '#E2DFD5',
        muted: { DEFAULT: '#8A93A0', text: '#5B6472' },
        accent: { DEFAULT: '#0F6E56', bg: '#E1F5EE' },
        gold: '#9C7A3C',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
    },
  },
}
```

Uso nas classes: `text-navy`, `bg-bg`, `bg-card`, `border-border`, `text-muted-text`, `text-accent`, `bg-accent-bg`, `font-display` (headlines), `font-sans` (padrão, já é o default).

## 5. Responsividade

O arquivo já está com dois breakpoints:

- **≤860px** (tablet): esconde os links de texto do menu (mantém o botão "Entrar no painel"), empilha grids de 3 colunas em 1, reduz padding de seção.
- **≤480px** (celular): fonte do H1 cai pra 27px, botões da hero viram largura total empilhados, carrossel mostra ~1.2 card por vez (78vw), grade de logos vira 2 colunas, footer empilha.

Como a maioria do seu público acessa por celular, o breakpoint de 480px foi o mais revisado — todo botão de CTA aí vira full-width (mais fácil de tocar) e nenhum texto quebra em 2-3 linhas de forma estranha.

**Teste rápido no Chrome DevTools:** abra o `prinzo-landing.html`, `F12` → ícone de dispositivo móvel → teste em 375px (iPhone SE) e 390px (iPhone 13/14), que cobrem a maior parte do público brasileiro.
