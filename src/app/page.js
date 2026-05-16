'use client';
import { useState } from 'react';
import Image from 'next/image';

const WHATSAPP_NUMBER = '5598984809302';

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'mascote', label: '🦊 Mascotes' },
  { id: 'decorativo', label: '✨ Decorativos' },
  { id: 'copa', label: '🏆 Copa do Mundo' },
  { id: 'suporte', label: '🔧 Suportes' },
  { id: 'brinquedo', label: '🎮 Brinquedos' },
  { id: 'maternidade', label: '🍼 Maternidade' },
];

const PRODUCTS = [
  // MASCOTES
  { id: 4, category: 'mascote', name: 'Mascote Flamengo — Urubu', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-red-600', img: '/img/mascote-flamengo.png', hasImg: true, gradient: 'from-red-900 to-black', description: 'Mascote colecionável do Mengão, nas cores vermelho e preto. Perfeito para torcedores.' },
  { id: 5, category: 'mascote', name: 'Mascote Vasco — Almirante', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-neutral-800', hasImg: false, emoji: '⚓', gradient: 'from-neutral-900 to-neutral-600', description: 'Mascote do Gigante da Colina em preto e branco. Para o torcedor vascaíno raiz.' },
  { id: 6, category: 'mascote', name: 'Mascote Palmeiras — Porco', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-green-700', hasImg: false, emoji: '🐷', gradient: 'from-green-900 to-green-600', description: 'Mascote do Verdão em verde e branco. Decoração para o palmeirense apaixonado.' },
  { id: 7, category: 'mascote', name: 'Mascote Corinthians — Mosqueteiro', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-neutral-900', hasImg: false, emoji: '⚔️', gradient: 'from-neutral-800 to-neutral-500', description: 'Mascote alvinegro do Timão. Colecionável para o fiel torcedor corintiano.' },
  { id: 8, category: 'mascote', name: 'Mascote Vitória — Leão', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-red-700', hasImg: false, emoji: '🦁', gradient: 'from-red-800 to-red-500', description: 'Mascote do Leão da Barra em vermelho e preto. Para o torcedor baiano!' },
  { id: 9, category: 'mascote', name: 'Mascote São Paulo — Tricolor', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-red-500', hasImg: false, emoji: '🦅', gradient: 'from-red-700 via-neutral-800 to-gray-200', description: 'Mascote tricolor do SPFC nas cores vermelho, preto e branco.' },
  { id: 10, category: 'mascote', name: 'Mascote Santos — Baleia', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-neutral-100', hasImg: false, emoji: '🐳', gradient: 'from-neutral-100 to-neutral-400', description: 'Mascote do Peixe em branco e preto. Para o torcedor santista de coração.' },
  { id: 22, category: 'mascote', name: 'Mascote Botafogo — Biriba', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-neutral-900', hasImg: false, emoji: '🐶', gradient: 'from-neutral-900 to-neutral-600', description: 'O lendário cachorrinho Biriba do Glorioso. Um clássico alvinegro.' },
  { id: 23, category: 'mascote', name: 'Mascote Fluminense — Guerreirinho', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-red-900', hasImg: false, emoji: '🛡️', gradient: 'from-red-900 via-green-800 to-neutral-100', description: 'Mascote do Tricolor das Laranjeiras. Identidade e tradição carioca.' },
  { id: 24, category: 'mascote', name: 'Mascote Atlético MG — Galo', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-neutral-900', hasImg: false, emoji: '🐓', gradient: 'from-neutral-900 to-neutral-500', description: 'O Galo Doido em preto e branco. Decoração para o torcedor atleticano.' },
  { id: 25, category: 'mascote', name: 'Mascote Cruzeiro — Raposa', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-blue-800', hasImg: false, emoji: '🦊', gradient: 'from-blue-900 to-blue-600', description: 'A Raposa celeste do Cabuloso. Perfeito para decorar o ambiente do cruzeirense.' },
  { id: 26, category: 'mascote', name: 'Mascote Grêmio — Mosqueteiro', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-sky-600', hasImg: false, emoji: '🤺', gradient: 'from-sky-800 via-neutral-100 to-black', description: 'Mascote Imortal do Grêmio. Cores vibrantes e design detalhado.' },
  { id: 27, category: 'mascote', name: 'Mascote Internacional — Saci', price: 79.90, tag: 'Exclusivo', tagColor: 'bg-red-600', hasImg: false, emoji: '🌪️', gradient: 'from-red-900 to-red-500', description: 'O icônico Saci do Colorado. Peça única para o torcedor do Inter.' },
  { id: 28, category: 'mascote', name: 'Mascote do Seu Time', price: 120.00, tag: 'Personalizado', tagColor: 'bg-violet-600', hasImg: false, emoji: '🎨', gradient: 'from-violet-900 to-violet-600', description: 'Não encontrou seu time? Criamos mascotes de qualquer clube sob encomenda!' },
  // DECORATIVOS
  { id: 29, category: 'decorativo', name: 'Logo 3D Personalizada', price: 199.90, tag: 'Premium', tagColor: 'bg-cyan-500', hasImg: false, emoji: '🏢', gradient: 'from-cyan-900 to-blue-600', description: 'Sua logo transformada em uma peça 3D de alta qualidade para escritório ou home office.' },
  { id: 30, category: 'decorativo', name: 'Letreiro Retroiluminado', price: 259.90, tag: 'Destaque', tagColor: 'bg-yellow-500', hasImg: false, emoji: '💡', gradient: 'from-neutral-800 to-neutral-600', description: 'Nome ou palavra personalizada com iluminação LED integrada. Efeito neon futurista.' },
  { id: 31, category: 'decorativo', name: 'Quadro 3D Minimalista', price: 119.90, tag: 'Arte', tagColor: 'bg-purple-500', hasImg: false, emoji: '🖼️', gradient: 'from-purple-900 to-indigo-600', description: 'Arte geométrica em camadas 3D. Um toque moderno para qualquer ambiente.' },
  // MATERNIDADE
  { id: 1, category: 'maternidade', name: 'Placa Decorativa — Menina', price: 89.90, tag: 'Mais Vendido', tagColor: 'bg-rose-500', img: '/img/placa-menina.png', hasImg: true, description: 'Decoração com nome personalizado e elementos delicados para o quartinho da sua princesa.' },
  { id: 2, category: 'maternidade', name: 'Placa Decorativa — Menino', price: 89.90, tag: 'Mais Vendido', tagColor: 'bg-sky-500', img: '/img/placa-menino.png', hasImg: true, description: 'Decoração personalizada com o nome do seu guerreiro e elementos divertidos.' },
  { id: 3, category: 'maternidade', name: 'Móbile Decorativo', price: 149.90, tag: 'Novo', tagColor: 'bg-emerald-500', img: '/img/mobile-3d.png', hasImg: true, description: 'Móbile com estrelas, lua e nuvens. Leve, seguro e encantador para o quarto do bebê.' },
  // COPA
  { id: 11, category: 'copa', name: 'Taça da Copa do Mundo', price: 129.90, tag: 'Colecionável', tagColor: 'bg-yellow-600', hasImg: false, emoji: '🏆', gradient: 'from-yellow-700 to-yellow-400', description: 'Réplica fiel da Taça Jules Rimet da FIFA com acabamento dourado. 25cm de altura.' },
  { id: 12, category: 'copa', name: 'Chaveiro — Taça da Copa', price: 29.90, tag: 'Mini', tagColor: 'bg-yellow-500', hasImg: false, emoji: '🔑', gradient: 'from-amber-600 to-yellow-400', description: 'Mini réplica da Taça do Mundo em chaveiro com acabamento dourado metálico. 6cm.' },
  { id: 13, category: 'copa', name: 'Bola Oficial — Decorativa', price: 59.90, tag: 'Novo', tagColor: 'bg-emerald-500', hasImg: false, emoji: '⚽', gradient: 'from-neutral-700 to-neutral-400', description: 'Réplica decorativa da bola oficial da Copa. Ótima para presentes e coleções.' },
  // SUPORTES
  { id: 14, category: 'suporte', name: 'Suporte para Celular — Mesa', price: 34.90, tag: 'Útil', tagColor: 'bg-slate-600', hasImg: false, emoji: '📱', gradient: 'from-slate-700 to-slate-400', description: 'Suporte ergonômico para celular na mesa. Design minimalista e moderno.' },
  { id: 15, category: 'suporte', name: 'Stand para Headphone', price: 44.90, tag: 'Gamer', tagColor: 'bg-purple-600', hasImg: false, emoji: '🎧', gradient: 'from-purple-900 to-purple-500', description: 'Stand elegante para fone de ouvido. Compatível com qualquer modelo.' },
  { id: 16, category: 'suporte', name: 'Suporte para Controle', price: 39.90, tag: 'Gamer', tagColor: 'bg-indigo-600', hasImg: false, emoji: '🎮', gradient: 'from-indigo-900 to-indigo-500', description: 'Suporte de parede para PS5, Xbox ou Nintendo Switch. Sem parafusos.' },
  { id: 17, category: 'suporte', name: 'Organizador de Cabos', price: 24.90, tag: 'Kit c/ 5', tagColor: 'bg-teal-600', hasImg: false, emoji: '🔌', gradient: 'from-teal-700 to-teal-400', description: 'Clipes organizadores de cabos para mesa limpa e organizada. Pacote com 5.' },
  { id: 18, category: 'suporte', name: 'Modelagem Personalizada', price: 299.00, tag: 'Premium', tagColor: 'bg-violet-600', img: '/img/modeling_service.png', hasImg: true, description: 'Você imagina, a gente cria. Ideal para presentes únicos, empresas e projetos especiais.' },
  // BRINQUEDOS
  { id: 19, category: 'brinquedo', name: 'Dinossauro Articulado', price: 69.90, tag: 'Articulado', tagColor: 'bg-green-600', hasImg: false, emoji: '🦕', gradient: 'from-green-800 to-lime-500', description: 'T-Rex com juntas totalmente móveis e detalhes realistas. Seguro para +3 anos.' },
  { id: 20, category: 'brinquedo', name: 'Robô Articulado', price: 79.90, tag: 'Articulado', tagColor: 'bg-cyan-600', hasImg: false, emoji: '🤖', gradient: 'from-cyan-900 to-cyan-500', description: 'Robô futurista colecionável com braços, pernas e cabeça totalmente articulados.' },
  { id: 21, category: 'brinquedo', name: 'Dragão Articulado', price: 99.90, tag: 'Premium', tagColor: 'bg-orange-500', hasImg: false, emoji: '🐉', gradient: 'from-orange-900 to-red-600', description: 'Dragão com asas, cauda e pescoço articulados. Uma peça de colecionador impressionante.' },
];

function ProductCard({ product, onAddToCart, isAdded }) {
  const handleWA = () => {
    const msg = `Olá! Tenho interesse em: *${product.name}* — R$ ${product.price.toFixed(2).replace('.', ',')}. Pode me passar mais informações?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      className="rounded-3xl overflow-hidden border flex flex-col group transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
    >
      {/* Visual */}
      <div className="relative w-full overflow-hidden" style={{ height: '13rem' }}>
        {product.hasImg ? (
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
            <span className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow ${product.tagColor}`}>
          {product.tag}
        </span>
        <span className="absolute top-3 right-3 bg-black/70 text-white text-sm font-black px-3 py-1 rounded-full backdrop-blur-sm">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-base font-bold mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h2>
        <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--text-secondary)' }}>
          {product.description}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${isAdded
                ? 'border-green-500 bg-green-50/10 text-green-400'
                : 'border-neutral-200 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-[var(--accent)]'
              }`}
            style={!isAdded ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : {}}
          >
            {isAdded ? '✓ Adicionado' : '+ Carrinho'}
          </button>
          <button
            onClick={handleWA}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 text-white shadow-[0_5px_15px_rgba(0,145,255,0.3)] hover:shadow-[0_8px_25px_rgba(0,145,255,0.4)] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
          >
            Encomendar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [cart, setCart] = useState([]);
  const [addedId, setAddedId] = useState(null);

  const filtered = activeCategory === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists
        ? prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p)
        : [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));
  const totalQty = cart.reduce((acc, p) => acc + p.qty, 0);
  const totalPrice = cart.reduce((acc, p) => acc + p.price * p.qty, 0);

  const handleCheckout = () => {
    if (!cart.length) return;
    const lines = cart.map(p => `• ${p.name} (×${p.qty}) — R$ ${(p.price * p.qty).toFixed(2).replace('.', ',')}`);
    const msg = `Olá! Gostaria de encomendar os seguintes itens da *LJVision*:\n\n${lines.join('\n')}\n\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n\nPor favor, me informe prazo e forma de pagamento!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">

      {/* Hero */}
      <section className="text-center mb-12">
        <p className="font-semibold uppercase tracking-widest text-sm mb-3 drop-shadow-[0_0_10px_rgba(0,229,255,0.1)]" style={{ color: 'var(--accent)' }}>Produtos Exclusivos</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Coleção <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)]">Personalizada</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Mascotes de times, decoração de maternidade, colecionáveis da Copa, suportes e brinquedos articulados. Cada peça feita sob encomenda, com cuidado e atenção aos detalhes.
        </p>
      </section>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap justify-center mb-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
            style={
              activeCategory === cat.id
                ? { backgroundColor: 'var(--accent)', color: 'var(--cart-text)', borderColor: 'var(--accent)', boxShadow: '0 4px 15px rgba(0,229,255,0.2)' }
                : { backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            isAdded={addedId === product.id}
          />
        ))}
      </div>

      {/* Carrinho flutuante */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div
            className="rounded-3xl shadow-2xl p-5 border"
            style={{ backgroundColor: 'var(--cart-bg)', color: 'var(--cart-text)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">🛒 Carrinho</span>
                <span className="bg-[var(--accent)] text-[var(--cart-text)] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                  {totalQty}
                </span>
              </div>
              <span className="font-black text-xl drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]" style={{ color: 'var(--accent)' }}>
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="space-y-2 mb-4 max-h-28 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="truncate flex-1">{item.name} × {item.qty}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-3 hover:text-red-400 transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Finalizar via WhatsApp
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
