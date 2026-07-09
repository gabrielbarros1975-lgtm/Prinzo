'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback, use } from 'react';
import { fetchProducts } from '@/lib/fetchProducts';
import { fetchCategories } from '@/lib/fetchCategories';
import { generatePixPayload } from '@/lib/pixHelper';

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
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            width: '100%',
            position: 'relative',
            borderRadius: '1rem',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          }}>
          <Image
            src={images[idx]}
            alt={`Imagem ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 90vw, 90vw"
            style={{ objectFit: 'contain', borderRadius: '1rem' }}
          />
        </div>

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
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Image src={src} alt="" fill style={{ objectFit: 'cover' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────────────── */
function ProductCard({ product, onAddToCart, onBuyNow, isAdded, whatsappNumber }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [customName, setCustomName] = useState('');

  const allImages = [];
  if (product.img) allImages.push(product.img);
  if (Array.isArray(product.images)) {
    product.images.forEach(u => { if (u && !allImages.includes(u)) allImages.push(u); });
  }

  const hasImages = allImages.length > 0;

  const handleBuy = () => {
    onBuyNow(product, customName);
    setCustomName('');
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
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ height: '13rem', cursor: hasImages ? 'zoom-in' : 'default' }}
          onClick={() => hasImages && setLightboxIndex(0)}
        >
          {hasImages ? (
            <>
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                <div className="group-hover:scale-105 transition-transform duration-500" style={{ width: '100%', height: '100%' }}>
                  <Image
                    src={allImages[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
              {allImages.length > 1 && (
                <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                  {allImages.map((_, i) => (
                    <span key={i} style={{ width: i === 0 ? '1.5rem' : '0.4rem', height: '0.4rem', borderRadius: '9999px', background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.5)', transition: 'width 0.2s' }} />
                  ))}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyWindow: 'center', color: '#fff', fontSize: '1.5rem', opacity: 0 }} className="group-hover:opacity-100 group-hover:!bg-black/20 flex items-center justify-center dark:group-hover:!bg-white/30 dark:text-black">🔍</div>
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${product.gradient || ''} flex items-center justify-center`}>
              <span className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
            </div>
          )}
          {product.tag && (
            <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow ${product.tag_color || 'bg-blue-600'}`} style={{ color: '#ffffff' }}>
              {product.tag}
            </span>
          )}
          <span className="absolute top-3 right-3 bg-black/70 text-white text-sm font-black px-3 py-1 rounded-full backdrop-blur-sm dark:bg-white/80 dark:text-black">
            R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-base font-bold mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h2>
          <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
            {product.description}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-2 border-neutral-200 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-[var(--accent)]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              {isAdded ? '✓ Adicionado' : '+ Carrinho'}
            </button>
            <button
              onClick={handleBuy}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-[0_5px_15px_rgba(0,145,255,0.3)] hover:shadow-[0_8px_25px_rgba(0,145,255,0.4)] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
            >
              Comprar ⚡
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Shop Catalog Component ───────────────────────────────── */
export default function ShopPage({ params }) {
  const unwrappedParams = use(params);
  const storeSlug = unwrappedParams?.storeSlug;

  const [store, setStore] = useState(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('todos');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [cart, setCart] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const [mpLoading, setMpLoading] = useState(false);

  // Pix Modal state
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch Store Details
  useEffect(() => {
    if (!storeSlug) return;

    const loadStore = async () => {
      try {
        setStoreLoading(true);
        setStoreError(null);

        const res = await fetch(`/api/stores?slug=${storeSlug}`);
        const data = await res.json();

        if (data.error) {
          setStoreError(data.error);
        } else {
          setStore(data);
        }
      } catch (err) {
        setStoreError(err.message);
      } finally {
        setStoreLoading(false);
      }
    };

    loadStore();
  }, [storeSlug]);

  // Fetch Categories
  useEffect(() => {
    if (!store) return;
    fetchCategories(store.id)
      .then(setCategories)
      .catch((error) => console.error('Erro ao carregar categorias:', error));
  }, [store]);

  // Fetch Products
  useEffect(() => {
    if (!store) return;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const result = await fetchProducts(activeCategory, store.id);
        setProducts(result);
      } catch (error) {
        setLoadError(error.message || 'Erro ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory, store]);

  const filterButtons = [
    { id: 'todos', label: 'Todos' },
    ...categories.map(c => ({
      id: c.slug,
      label: [c.emoji, c.name].filter(Boolean).join(' '),
    })),
  ];

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

  const getOrderSummaryText = () => {
    const lines = cart.map(p => {
      const customText = p.customName ? ` (Base: ${p.customName})` : '';
      return `• ${p.name}${customText} (×${p.qty}) — R$ ${(p.price * p.qty).toFixed(2).replace('.', ',')}`;
    });
    return `Olá! Gostaria de encomendar os seguintes itens de *${store.name}*:\n\n${lines.join('\n')}\n\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`;
  };

  const buyNow = (product, customName = '') => {
    const trimmedCustom = customName.trim();
    const cartItemId = `${product.id}_${trimmedCustom}`;

    setCart(prev => {
      const exists = prev.find(p => p.cartItemId === cartItemId);
      if (exists) return prev;
      return [...prev, { ...product, cartItemId, customName: trimmedCustom, qty: 1 }];
    });

    setTimeout(() => {
      const cartElement = document.getElementById('cart-floating');
      if (cartElement) {
        cartElement.scrollIntoView({ behavior: 'smooth' });
        cartElement.classList.add('animate-bounce');
        setTimeout(() => cartElement.classList.remove('animate-bounce'), 1000);
      }
    }, 150);
  };

  const handleCheckoutWA = () => {
    if (!cart.length) return;
    const msg = `${getOrderSummaryText()}\n\nPor favor, me passe o prazo de entrega e confirme o pedido!`;
    window.open(`https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCheckoutPix = () => {
    if (!cart.length) return;
    const payload = generatePixPayload({
      key: store.pix_key || '',
      name: store.pix_name || store.name,
      city: store.pix_city || 'Sao Paulo',
      amount: totalPrice,
      txid: `LOJA${store.slug.substring(0, 10).toUpperCase()}`
    });
    setPixPayload(payload);
    setPixModalOpen(true);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReceipt = () => {
    const msg = `${getOrderSummaryText()}\n\n*PAGO VIA PIX COM SUCESSO!*\nSeguem abaixo os detalhes. Estou enviando o comprovante em anexo nesta conversa.`;
    window.open(`https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCheckoutMP = async () => {
    if (!cart.length || mpLoading) return;
    setMpLoading(true);
    localStorage.setItem('ljvision_last_cart', JSON.stringify(cart));
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_slug: storeSlug,
          items: cart.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: p.qty,
            customName: p.customName,
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

  if (storeLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-40">
        <div className="text-xl font-medium animate-pulse">Carregando loja...</div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 px-4 text-center">
        <span className="text-6xl mb-4">🏪</span>
        <h1 className="text-2xl font-black mb-2">Loja Não Encontrada</h1>
        <p className="max-w-md" style={{ color: 'var(--text-secondary)' }}>O catálogo solicitado não está disponível ou a URL está incorreta.</p>
        <Link href="/" className="mt-6 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-page)' }}>Criar minha própria loja</Link>
      </div>
    );
  }

  // 5 dias de avaliação gratuita
  const isTrialActive = store?.created_at
    ? (new Date() - new Date(store.created_at)) < 5 * 24 * 60 * 60 * 1000
    : false;

  const isStoreAccessible = store?.subscription_active || isTrialActive;

  if (!isStoreAccessible) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 px-4 text-center">
        <span className="text-6xl mb-4">⚠️</span>
        <h1 className="text-2xl font-black mb-2">Período de Avaliação Expirado</h1>
        <p className="max-w-md" style={{ color: 'var(--text-secondary)' }}>Esta loja ({store.name}) está temporariamente inativa. Ative sua assinatura Premium no painel para continuar vendendo.</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Se você é o proprietário, acesse o painel administrativo para reativar.</p>
        <Link href="/admin" className="mt-6 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)' }}>Ir para o Painel</Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="font-semibold uppercase tracking-widest text-[10px] sm:text-xs md:text-sm mb-3 text-[var(--accent)] max-w-xl truncate">
            {store.description || 'Seja bem-vindo!'}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight sm:leading-snug max-w-full break-words" style={{ color: 'var(--text-primary)' }}>
            Catálogo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--logo-primary)] to-[var(--logo-secondary)] inline-block break-words max-w-full">
              {store.name}
            </span>
          </h1>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 overflow-x-auto px-2">
        {filterButtons.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all border whitespace-nowrap"
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
        <div className="text-center py-20 text-lg font-semibold text-rose-500">
          {loadError}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Nenhum produto cadastrado nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              isAdded={addedId === product.id}
              whatsappNumber={store.whatsapp_number}
            />
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div id="cart-floating" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 transition-all duration-300">
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
              <span className="font-black text-xl text-[var(--accent)]">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="space-y-2 mb-4 max-h-28 overflow-y-auto">
              {cart.map(item => (
                <div key={item.cartItemId} className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="truncate flex-1">
                    {item.name} × {item.qty}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="ml-3 hover:text-rose-500 transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>

            {/* Ações de Checkout baseadas na configuração da loja */}
            <div className="flex flex-col gap-3 mt-4">
              {/* Botão WhatsApp */}
              {(store.payment_methods === 'whatsapp' || store.payment_methods === 'both' || store.payment_methods === 'all') && (
                <button
                  onClick={handleCheckoutWA}
                  className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    boxShadow: '0 5px 20px rgba(34,197,94,0.3)',
                  }}
                >
                  Pedir via WhatsApp
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </button>
              )}

              {/* Botão Pix Direto */}
              {(store.payment_methods === 'pix_direct' || store.payment_methods === 'both' || store.payment_methods === 'all') && store.pix_key && (
                <button
                  onClick={handleCheckoutPix}
                  className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #00B0FF 0%, #0081CB 100%)',
                    color: '#fff',
                    boxShadow: '0 5px 20px rgba(0,176,255,0.3)',
                  }}
                >
                  Pagar com Pix Direto
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Código/QR</span>
                </button>
              )}

              {/* Botão Mercado Pago */}
              {(store.payment_methods === 'mercadopago' || store.payment_methods === 'all') && store.mp_access_token && (
                <button
                  onClick={handleCheckoutMP}
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
                    <>Pagar com Mercado Pago 💳</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pix Modal */}
      {pixModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute top-4 right-4 text-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >✕</button>

            <span className="text-4xl mb-2 inline-block">📱</span>
            <h3 className="text-xl font-black mb-1">Pagamento via Pix</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Escaneie o QR Code abaixo ou copie o código para pagar</p>

            {/* QR Code Container */}
            <div className="p-3 rounded-2xl inline-block mb-4 shadow" style={{ backgroundColor: 'var(--bg-card)', position: 'relative', width: '12rem', height: '12rem' }}>
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`}
                alt="Pix QR Code"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* Valor total do Pix */}
            <div className="mb-4 py-2 rounded-xl border" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Valor a Pagar:</span>
              <span className="text-xl font-black" style={{ color: 'var(--accent-hover)' }}>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopyPix}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-colors border"
                style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {copied ? '✓ Código Copiado!' : 'Copiar Código Pix'}
              </button>

              <button
                onClick={handleSendReceipt}
                className="w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-opacity hover:opacity-95 text-white"
                style={{ background: 'linear-gradient(to right, #22c55e, #16a34a)' }}
              >
                Confirmar & Enviar Comprovante
              </button>
            </div>
            <p className="text-[10px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              *Importante: O comprovante de pagamento deverá ser enviado no WhatsApp do vendedor clicando no botão acima.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
