'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { fetchProducts } from '@/lib/fetchProducts';
import { fetchCategories } from '@/lib/fetchCategories';

const WHATSAPP_NUMBER = '5598984809302';

/* ─── Lightbox ─────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex ?? 0);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  if (!images?.length) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* Main image */}
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[idx]}
          alt={`Imagem ${idx + 1}`}
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '1rem',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-2.5rem',
            right: 0,
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            width: '2.2rem',
            height: '2.2rem',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Fechar"
        >✕</button>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute',
                left: '-3.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                borderRadius: '50%',
                width: '2.8rem',
                height: '2.8rem',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
              aria-label="Anterior"
            >‹</button>
            <button
              onClick={next}
              style={{
                position: 'absolute',
                right: '-3.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                borderRadius: '50%',
                width: '2.8rem',
                height: '2.8rem',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
              aria-label="Próxima"
            >›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
          }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: i === idx ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                padding: 0,
                background: 'none',
                flexShrink: 0,
              }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────────────── */
function ProductCard({ product, onAddToCart, isAdded }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [customName, setCustomName] = useState('');

  // Build full image list: primary img + extra images[]
  const allImages = [];
  if (product.img) allImages.push(product.img);
  if (Array.isArray(product.images)) {
    product.images.forEach(u => { if (u && !allImages.includes(u)) allImages.push(u); });
  }

  const hasImages = allImages.length > 0;

  const handleWA = () => {
    const trimmed = customName.trim();
    const customText = trimmed ? ` (Personalização da base: "${trimmed}")` : '';
    const msg = `Olá! Tenho interesse em: *${product.name}*${customText} — R$ ${product.price.toFixed(2).replace('.', ',')}. Pode me passar mais informações?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAdd = () => {
    onAddToCart(product, customName);
    setCustomName('');
  };

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox images={allImages} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

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
        <div
          className="relative w-full overflow-hidden"
          style={{ height: '13rem', cursor: hasImages ? 'zoom-in' : 'default' }}
          onClick={() => hasImages && setLightboxIndex(0)}
        >
          {hasImages ? (
            <>
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'var(--bg-card)' }}
              >
                <img
                  src={allImages[0]}
                  alt={product.name}
                  className="group-hover:scale-105 transition-transform duration-500"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              {/* Multi-image indicator */}
              {allImages.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  {allImages.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === 0 ? '1.5rem' : '0.4rem',
                        height: '0.4rem',
                        borderRadius: '9999px',
                        background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                        transition: 'width 0.2s',
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Zoom hint overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0)',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.5rem',
                  opacity: 0,
                }}
                className="group-hover:opacity-100 group-hover:!bg-black/20"
              >
                🔍
              </div>
            </>
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
          <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
            {product.description}
          </p>

          {/* Campo de Personalização (Mascotes) */}
          {product.category === 'Mascotes de Times' && (
            <div className="mb-4">
              <label className="block text-xs font-bold mb-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                Nome na base (opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Gabriel, Arthur..."
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                maxLength={15}
                className="w-full text-xs p-2 rounded-xl outline-none border transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
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
    </>
  );
}

/* ─── CatalogPage ───────────────────────────────────────────────── */
export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [cart, setCart] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const [mpLoading, setMpLoading] = useState(false);

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

  const addToCart = (product, customName = '') => {
    const trimmedCustom = customName.trim();
    const cartItemId = `${product.id}_${trimmedCustom}`;

    setCart(prev => {
      const exists = prev.find(p => p.cartItemId === cartItemId);
      return exists
        ? prev.map(p => p.cartItemId === cartItemId ? { ...p, qty: p.qty + 1 } : p)
        : [...prev, { ...product, cartItemId, customName: trimmedCustom, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const removeFromCart = (cartItemId) => setCart(prev => prev.filter(p => p.cartItemId !== cartItemId));
  const totalQty = cart.reduce((acc, p) => acc + p.qty, 0);
  const totalPrice = cart.reduce((acc, p) => acc + p.price * p.qty, 0);

  const handleCheckout = () => {
    if (!cart.length) return;

    // Salvar no localStorage antes do checkout
    localStorage.setItem('ljvision_last_cart', JSON.stringify(cart));

    const lines = cart.map(p => {
      const customText = p.customName ? ` (Base: ${p.customName})` : '';
      return `• ${p.name}${customText} (×${p.qty}) — R$ ${(p.price * p.qty).toFixed(2).replace('.', ',')}`;
    });
    const msg = `Olá! Gostaria de encomendar os seguintes itens da *LJVision*:\n\n${lines.join('\n')}\n\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n\nPor favor, me informe prazo e forma de pagamento!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleMercadoPago = async () => {
    if (!cart.length || mpLoading) return;
    setMpLoading(true);

    // Salvar no localStorage antes do checkout
    localStorage.setItem('ljvision_last_cart', JSON.stringify(cart));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: p.qty,
            customName: p.customName
          }))
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao criar pagamento');
      window.location.href = data.init_point;
    } catch (err) {
      alert(err.message);
    } finally {
      setMpLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">

      {/* Hero */}
      <section className="text-center mb-12">
        <p className="font-semibold uppercase tracking-widest text-sm mb-3 drop-shadow-[0_0_10px_rgba(0,229,255,0.1)]" style={{ color: 'var(--accent)' }}>Produtos Exclusivos</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Coleção <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)]">Personalizada</span>
        </h1>

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
                <div key={item.cartItemId} className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="truncate flex-1">
                    {item.name} {item.customName ? `(Base: ${item.customName})` : ''} × {item.qty}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="ml-3 hover:text-red-400 transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>

            {/* Ações do Carrinho */}
            <div className="flex flex-col gap-3 mt-4">
              {/* Botão Mercado Pago */}
              <button
                onClick={handleMercadoPago}
                disabled={mpLoading}
                className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #009ee3 0%, #00bcff 100%)',
                  color: '#fff',
                  boxShadow: '0 5px 20px rgba(0,158,227,0.35)',
                }}
              >
                {mpLoading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="22" fill="#fff" fillOpacity="0.18"/>
                      <text x="24" y="30" textAnchor="middle" fontSize="18" fill="#fff" fontWeight="bold">MP</text>
                    </svg>
                    Pagar com Mercado Pago
                  </>
                )}
              </button>

              {/* Botão WhatsApp */}
              <button
                onClick={handleCheckout}
                className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  boxShadow: '0 5px 20px rgba(34,197,94,0.3)',
                }}
              >
                Encomendar via WhatsApp
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
