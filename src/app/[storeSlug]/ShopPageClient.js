'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback, useMemo, useRef, use } from 'react';
import { createPortal } from 'react-dom';
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
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-8"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="relative mx-auto rounded-[1.25rem] overflow-hidden"
          style={{ width: '100%', minHeight: '20rem', maxHeight: '80vh', background: 'rgba(15, 23, 42, 0.95)' }}
        >
          <Image
            src={images[idx]}
            alt={`Imagem ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            style={{ objectFit: 'contain' }}
          />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '9999px',
              width: '2.8rem',
              height: '2.8rem',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            aria-label="Fechar"
          >✕</button>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.55)',
                  border: 'none',
                  borderRadius: '9999px',
                  width: '2.8rem',
                  height: '2.8rem',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
                aria-label="Anterior"
              >‹</button>
              <button
                onClick={next}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.55)',
                  border: 'none',
                  borderRadius: '9999px',
                  width: '2.8rem',
                  height: '2.8rem',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
                aria-label="Próxima"
              >›</button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div
            className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2"
            style={{ minWidth: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="shrink-0 rounded-2xl overflow-hidden"
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  border: i === idx ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="relative w-full h-full">
                  <Image src={src} alt={`Miniatura ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────────────── */
function ProductCard({ product, onBuyNow, whatsappNumber }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  // Simple portal modal to avoid clipping inside card containers
  function PortalModal({ children, onClose }) {
    const hostRef = useRef(null);
    if (!hostRef.current && typeof document !== 'undefined') hostRef.current = document.createElement('div');

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      document.body.appendChild(host);
      return () => {
        if (host.parentNode) host.parentNode.removeChild(host);
      };
    }, []);

    if (!hostRef.current) return null;

    return createPortal(
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
        <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[var(--bg-card)] p-6 max-h-[90vh] overflow-y-auto" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>,
      hostRef.current
    );
  }

  const allImages = [];
  if (product.img) allImages.push(product.img);
  if (Array.isArray(product.images)) {
    product.images.forEach(u => { if (u && !allImages.includes(u)) allImages.push(u); });
  }

  const hasImages = allImages.length > 0;

  const handleBuy = () => {
    onBuyNow(product);
  };

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox images={allImages} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <div
        className="rounded-3xl overflow-hidden border flex flex-col group hover:-translate-y-1 transition-all duration-300 h-full relative"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="product-image-container group cursor-pointer h-44 sm:h-56 relative"
          onClick={() => hasImages && setLightboxIndex(0)}
          style={{ minHeight: '10rem' }}
        >
          {hasImages ? (
            <>
              <div className="product-image-wrapper group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={allImages[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  loading="eager"
                  priority={false}
                />
              </div>
              {allImages.length > 1 && (
                <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                  {allImages.map((_, i) => (
                    <span key={i} style={{ width: i === 0 ? '1.5rem' : '0.4rem', height: '0.4rem', borderRadius: '9999px', background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.5)', transition: 'width 0.2s' }} />
                  ))}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', opacity: 0 }} className="group-hover:opacity-100 group-hover:!bg-black/20 flex items-center justify-center dark:group-hover:!bg-white/30 dark:text-black">🔍</div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-bg), var(--card))' }}>
              <span className="text-6xl sm:text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
            </div>
          )}
          {product.tag && (
            <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow ${product.tag_color || 'bg-[var(--accent)]'}`} style={{ color: '#ffffff' }}>
              {product.tag}
            </span>
          )}
          <span className="absolute bottom-3 right-3 bg-black/70 text-white text-sm sm:text-base font-black px-3 py-1.5 rounded-full backdrop-blur-sm dark:bg-white/80 dark:text-black">
            R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-base font-bold mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h2>
          <div className="text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }} title={product.description || ''}>
            <span className="min-w-0 line-clamp-2 sm:line-clamp-1">{product.description}</span>
            {product.description && product.description.length > 160 && (
              <button onClick={() => setDescExpanded(true)} className="text-xs font-semibold text-[var(--accent)] shrink-0">ver mais</button>
            )}
          </div>

          {descExpanded && (
            <PortalModal onClose={() => setDescExpanded(false)}>
              <h3 className="font-bold mb-2">Descrição</h3>
              <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{product.description}</div>
              <div className="text-right">
                <button onClick={() => setDescExpanded(false)} className="px-4 py-2 rounded-full border" style={{ borderColor: 'var(--border-color)' }}>Fechar</button>
              </div>
            </PortalModal>
          )}

          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleBuy}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff', boxShadow: '0 12px 24px rgba(19, 42, 70, 0.14)' }}
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Shop Catalog Component ───────────────────────────────── */
export default function ShopPageClient({ storeSlug }) {

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
  const [sortOption, setSortOption] = useState('az');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);
  const categoryScrollRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalStep, setCartModalStep] = useState('preview');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [orderNotes, setOrderNotes] = useState('');

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

  const addToCart = (product, customName = '', quantity = 1) => {
    const trimmedCustom = customName.trim();
    const cartItemId = `${product.id}_${trimmedCustom}`;

    setCart(prev => {
      const exists = prev.find(p => p.cartItemId === cartItemId);
      return exists
        ? prev.map(p => p.cartItemId === cartItemId ? { ...p, qty: p.qty + quantity } : p)
        : [...prev, { ...product, cartItemId, customName: trimmedCustom, qty: quantity }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const updateCartQuantity = (cartItemId, nextQty) => {
    setCart(prev => {
      if (nextQty < 1) {
        return prev.filter(item => item.cartItemId !== cartItemId);
      }
      return prev.map(item => item.cartItemId === cartItemId ? { ...item, qty: nextQty } : item);
    });
  };

  const removeFromCart = (cartItemId) => setCart(prev => prev.filter(p => p.cartItemId !== cartItemId));
  const totalQty = cart.reduce((acc, p) => acc + p.qty, 0);
  const totalPrice = cart.reduce((acc, p) => acc + p.price * p.qty, 0);

  const sortedProducts = useMemo(() => {
    if (!products?.length) return [];

    const copy = [...products];
    const normalizeText = (value) => String(value || '').toLowerCase().trim();
    const createdAt = (item) => item.created_at ? new Date(item.created_at).getTime() : 0;

    switch (sortOption) {
      case 'za':
        return copy.sort((a, b) => normalizeText(b.name).localeCompare(normalizeText(a.name)));
      case 'price_low':
        return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_high':
        return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'newest':
        return copy.sort((a, b) => createdAt(b) - createdAt(a) || (b.id || 0) - (a.id || 0));
      default:
        return copy.sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name)));
    }
  }, [products, sortOption]);

  const sortOptions = [
    { value: 'az', label: 'A - Z' },
    { value: 'za', label: 'Z - A' },
    { value: 'price_low', label: 'Menor Preço' },
    { value: 'price_high', label: 'Maior Preço' },
    { value: 'newest', label: 'Novidades' },
  ];

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [sortMenuOpen]);

  const getOrderSummaryText = () => {
    const lines = cart.map(p => {
      const customText = p.customName ? ` (Base: ${p.customName})` : '';
      return `• ${p.name}${customText} (×${p.qty}) — R$ ${(p.price * p.qty).toFixed(2).replace('.', ',')}`;
    });
    return `Olá! Gostaria de encomendar os seguintes itens de *${store.name}*:\n\n${lines.join('\n')}\n\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`;
  };

  const buyNow = (product) => {
    setSelectedProduct(product);
    setCartModalStep('preview');
    setCartModalOpen(true);
  };

  const handleCheckoutWA = () => {
    if (!cart.length) return;
    const msg = `${getOrderSummaryText()}\n\nPor favor, me passe o prazo de entrega e confirme o pedido!`;
    window.open(`https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCheckoutPix = () => {
    if (!cart.length) return;
    if (!store.pix_key || !store.pix_name) {
      alert('Chave Pix ou nome do titular não configurados. Verifique as configurações da loja.');
      return;
    }
    try {
      const payload = generatePixPayload({
        key: store.pix_key.trim(),
        name: store.pix_name.trim(),
        city: (store.pix_city || 'Sao Paulo').trim(),
        amount: totalPrice,
        txid: `LOJA${store.slug.substring(0, 10).toUpperCase()}`
      });
      setPixPayload(payload);
      setPixModalOpen(true);
    } catch (err) {
      alert(`Erro ao gerar QR Code Pix: ${err.message}`);
    }
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
            <span className="inline-block break-words max-w-full" style={{ color: 'var(--accent)' }}>
              {store.name}
            </span>
          </h1>
        </div>
      </header>

      {/* Filtros de categoria */}
      <div className="relative mb-4 px-2">
        <div
          ref={categoryScrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden py-2 pr-16 pl-4 snap-x snap-mandatory touch-pan-x scrollbar-none min-w-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filterButtons.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap snap-start"
              style={
                activeCategory === cat.id
                  ? { backgroundColor: 'var(--accent)', color: 'var(--cart-text)', borderColor: 'var(--accent)' }
                  : { backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex">
          <button
            type="button"
            onClick={() => categoryScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="rounded-full border p-2 bg-[var(--bg-card)] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
            aria-label="Ver próximas categorias"
          >
            ›
          </button>
        </div>
      </div>

      {/* Botão de ordenação */}
      <div className="flex items-center justify-between mb-6 px-2 gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Produto</span>

        <div className="flex items-center gap-3">
          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setSortMenuOpen(open => !open)}
              className="rounded-full border p-2 flex items-center justify-center"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Abrir opções de ordenação"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M3 4.5h18M7 12h10M10 19.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {sortMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  minWidth: '12rem',
                  zIndex: 20,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setSortMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setCartModalStep('summary');
              setCartModalOpen(true);
            }}
            className="relative rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)]"
            aria-label="Abrir carrinho"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6m0 0h12m-12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
            </svg>
            {totalQty > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-black text-[var(--cart-text)]">
                {totalQty}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Produtos */}
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-28">
          {sortedProducts.map(product => (
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

      {cartModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-[var(--bg-card)] shadow-2xl" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <button
              onClick={() => {
                setCartModalOpen(false);
                setSelectedProduct(null);
                setCartModalStep('preview');
              }}
              className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 text-lg sm:text-xl font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Fechar modal"
            >
              ✕
            </button>

            <div className="max-h-[95vh] sm:max-h-[88vh] overflow-hidden">
              <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6" style={{ maxHeight: 'calc(95vh - 2rem)' }}>
                {cartModalStep === 'preview' && selectedProduct && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Confirme seu pedido</div>
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="relative h-40 sm:h-56 w-full overflow-hidden rounded-3xl bg-neutral-100 flex items-center justify-center">
                        <Image
                          src={selectedProduct.img || selectedProduct.images?.[0] || '/img/placeholder.png'}
                          alt={selectedProduct.name}
                          fill
                          sizes="(max-width: 640px) 100%, (max-width: 1024px) 150px, 220px"
                          style={{ objectFit: 'contain', objectPosition: 'center' }}
                        />
                      </div>
                      <div className="flex flex-col justify-between gap-3 sm:gap-4">
                        <div>
                          <h2 className="text-lg sm:text-2xl font-black">{selectedProduct.name}</h2>
                          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {selectedProduct.description}
                          </p>
                        </div>
                        <div className="rounded-3xl border p-3 sm:p-4" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Preço</div>
                          <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black">R$ {(selectedProduct.price || 0).toFixed(2).replace('.', ',')}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setCartModalStep('summary');
                        }}
                        className="flex-1 rounded-2xl bg-[var(--accent)] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95"
                      >
                        Ir para o carrinho
                      </button>
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setCartModalOpen(false);
                          setSelectedProduct(null);
                        }}
                        className="flex-1 rounded-2xl border border-[var(--border-color)] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-card)]"
                      >
                        Continuar comprando
                      </button>
                    </div>
                  </div>
                )}

                {cartModalStep === 'summary' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Carrinho</div>
                        <div className="mt-1 sm:mt-2 text-base sm:text-lg font-black">{cart.length} item{cart.length === 1 ? '' : 's'}</div>
                      </div>
                      <div className="text-right text-xs sm:text-sm text-[var(--text-secondary)]">
                        Subtotal
                        <div className="text-lg sm:text-xl font-black text-[var(--accent)]">R$ {totalPrice.toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>

                    <div className="rounded-3xl border p-3 sm:p-4" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="space-y-3 sm:space-y-4 max-h-[30vh] sm:max-h-[35vh] overflow-y-auto pr-2">
                        {cart.length > 0 ? cart.map(item => (
                          <div key={item.cartItemId} className="flex flex-col gap-2 sm:gap-3 rounded-3xl border-b border-[var(--border-color)] pb-3 sm:pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-3xl bg-neutral-100 shrink-0 flex items-center justify-center">
                                <Image
                                  src={item.img || item.images?.[0] || '/img/placeholder.png'}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 640px) 56px, 64px"
                                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm sm:text-base line-clamp-2">{item.name}</div>
                                <div className="text-xs sm:text-sm text-[var(--text-secondary)]">R$ {(item.price || 0).toFixed(2).replace('.', ',')} cada</div>
                              </div>
                              <div className="text-xs sm:text-sm font-bold whitespace-nowrap">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-1 sm:gap-2 rounded-full border border-[var(--border-color)] px-1.5 py-1 sm:px-2 sm:py-1">
                                <button
                                  onClick={() => updateCartQuantity(item.cartItemId, item.qty - 1)}
                                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[var(--bg-card)] text-xs sm:text-sm font-bold transition hover:bg-[rgba(0,0,0,0.04)]"
                                >
                                  −
                                </button>
                                <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-semibold">{item.qty}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.cartItemId, item.qty + 1)}
                                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[var(--bg-card)] text-xs sm:text-sm font-bold transition hover:bg-[rgba(0,0,0,0.04)]"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="text-xs sm:text-sm font-semibold text-rose-500"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Seu carrinho está vazio. Adicione um produto para continuar.</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCartModalOpen(false);
                      }}
                      className="w-full rounded-2xl border border-[var(--border-color)] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-card)]"
                    >
                      Continuar comprando
                    </button>

                    <div className="space-y-3 sm:space-y-4 rounded-3xl border p-3 sm:p-4" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Entrega</div>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <label className="flex items-center gap-3 rounded-2xl border px-3 sm:px-4 py-2 sm:py-3 cursor-pointer text-sm sm:text-base" style={{ borderColor: deliveryMethod === 'pickup' ? 'var(--accent)' : 'var(--border-color)' }}>
                          <input
                            type="radio"
                            name="delivery"
                            value="pickup"
                            checked={deliveryMethod === 'pickup'}
                            onChange={() => setDeliveryMethod('pickup')}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span className="font-medium">Retirar na loja</span>
                        </label>
                        <label className="flex items-center gap-3 rounded-2xl border px-3 sm:px-4 py-2 sm:py-3 cursor-pointer text-sm sm:text-base" style={{ borderColor: deliveryMethod === 'delivery' ? 'var(--accent)' : 'var(--border-color)' }}>
                          <input
                            type="radio"
                            name="delivery"
                            value="delivery"
                            checked={deliveryMethod === 'delivery'}
                            onChange={() => setDeliveryMethod('delivery')}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span className="font-medium">Entregar no meu endereço</span>
                        </label>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-semibold">Observações (opcional)</label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-3xl border border-[var(--border-color)] bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
                          placeholder="Digite algo sobre entrega, cor ou outro pedido especial"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setCartModalStep('payment')}
                      className="w-full rounded-2xl bg-[var(--accent)] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95"
                    >
                      Avançar para pagamento
                    </button>
                  </div>
                )}

                {cartModalStep === 'payment' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Pagamento</div>
                        <div className="mt-1 sm:mt-2 text-base sm:text-lg font-black">Total: R$ {totalPrice.toFixed(2).replace('.', ',')}</div>
                      </div>
                      <button
                        onClick={() => setCartModalStep('summary')}
                        className="rounded-2xl border border-[var(--border-color)] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {(store.payment_methods === 'whatsapp' || store.payment_methods === 'both' || store.payment_methods === 'all') && (
                        <button
                          onClick={() => {
                            handleCheckoutWA();
                            setCartModalOpen(false);
                          }}
                          className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95"
                        >
                          Pagar via WhatsApp
                        </button>
                      )}

                      {(store.payment_methods === 'pix_direct' || store.payment_methods === 'both' || store.payment_methods === 'all') && store.pix_key && (
                        <button
                          onClick={() => {
                            handleCheckoutPix();
                            setCartModalOpen(false);
                          }}
                          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95"
                        >
                          Pagar com Pix Direto
                        </button>
                      )}

                      {(store.payment_methods === 'mercadopago' || store.payment_methods === 'all') && store.mp_access_token && (
                        <button
                          onClick={() => {
                            handleCheckoutMP();
                            setCartModalOpen(false);
                          }}
                          className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                          disabled={mpLoading}
                        >
                          {mpLoading ? 'Processando pagamento...' : 'Pagar com Mercado Pago'}
                        </button>
                      )}
                    </div>

                    {(store.payment_methods !== 'whatsapp' && store.payment_methods !== 'pix_direct' && store.payment_methods !== 'mercadopago' && store.payment_methods !== 'both' && store.payment_methods !== 'all') && (
                      <div className="rounded-3xl border border-rose-500 bg-rose-50 p-3 sm:p-4 text-xs sm:text-sm text-rose-700">
                        Nenhuma forma de pagamento disponível no momento.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pix Modal */}
      {pixModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-3xl p-4 sm:p-6 max-w-sm w-full text-center relative shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-base sm:text-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >✕</button>

            <span className="text-3xl sm:text-4xl mb-2 inline-block">📱</span>
            <h3 className="text-lg sm:text-xl font-black mb-1">Pagamento via Pix</h3>
            <p className="text-xs mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>Escaneie o QR Code abaixo ou copie o código para pagar</p>

            {/* QR Code Container */}
            <div className="p-2 sm:p-3 rounded-2xl inline-block mb-3 sm:mb-4 shadow" style={{ backgroundColor: 'var(--bg-card)', position: 'relative', width: '10rem', height: '10rem' }}>
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`}
                alt="Pix QR Code"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* Valor total do Pix */}
            <div className="mb-3 sm:mb-4 py-2 rounded-xl border" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Valor a Pagar:</span>
              <span className="text-lg sm:text-xl font-black" style={{ color: 'var(--accent-hover)' }}>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <button
                onClick={handleCopyPix}
                className="w-full py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors border"
                style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {copied ? '✓ Código Copiado!' : 'Copiar Código Pix'}
              </button>

              <button
                onClick={handleSendReceipt}
                className="w-full py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-opacity hover:opacity-95 text-white"
                style={{ background: 'linear-gradient(to right, #22c55e, #16a34a)' }}
              >
                Confirmar & Enviar Comprovante
              </button>
            </div>
            <p className="text-[9px] sm:text-[10px] mt-2 sm:mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              *Importante: O comprovante de pagamento deverá ser enviado no WhatsApp do vendedor clicando no botão acima.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}