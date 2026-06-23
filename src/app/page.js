'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchProducts } from '@/lib/fetchProducts';
import { fetchCategories } from '@/lib/fetchCategories';

const WHATSAPP_NUMBER = '5598984809302';

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
        {product.has_img || product.hasImg ? (
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${product.gradient || ''} flex items-center justify-center`}>
            <span className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow ${product.tag_color || product.tagColor || ''}`}>
          {product.tag}
        </span>
        <span className="absolute top-3 right-3 bg-black/70 text-white text-sm font-black px-3 py-1 rounded-full backdrop-blur-sm">
          R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}
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
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [cart, setCart] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((error) => console.error('Erro ao carregar categorias:', error));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    fetchProducts(activeCategory)
      .then(setProducts)
      .catch((error) => setLoadError(error.message || 'Erro ao carregar produtos'))
      .finally(() => setIsLoading(false));
  }, [activeCategory]);

  const filterButtons = [
    { id: 'todos', label: 'Todos' },
    ...categories.map(c => ({
      id: c.slug,
      label: [c.emoji, c.name].filter(Boolean).join(' '),
    })),
  ];

  const filtered = products;

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
        {filterButtons.map(cat => (
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
      {isLoading ? (
        <div className="text-center py-20 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Carregando produtos...
        </div>
      ) : loadError ? (
        <div className="text-center py-20 text-lg font-semibold" style={{ color: 'var(--danger)' }}>
          {loadError}
        </div>
      ) : (
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
      )}

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
