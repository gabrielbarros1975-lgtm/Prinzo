'use client';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Simple in-memory request cache + in-progress tracker to avoid duplicate rapid GETs
const __fetchCache = new Map(); // url -> { data, ts }
const __inProgress = new Map(); // url -> Promise

async function fetchWithCache(url, { ttl = 2000, force = false } = {}) {
  if (!force) {
    const hit = __fetchCache.get(url);
    if (hit && (Date.now() - hit.ts) < ttl) {
      return hit.data;
    }
  }

  if (__inProgress.has(url)) {
    return __inProgress.get(url);
  }

  const p = (async () => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        __fetchCache.set(url, { data, ts: Date.now() });
        return data;
      }
      return { error: data?.error || `Request failed: ${res.status}` };
    } catch (err) {
      return { error: err.message };
    } finally {
      __inProgress.delete(url);
    }
  })();

  __inProgress.set(url, p);
  return p;
}

const SUPPORT_WA = '5598984809302';
const SUPPORT_MSG = encodeURIComponent('Olá! Preciso de suporte com o Prinzo.');
const SUPPORT_LINK = `https://wa.me/${SUPPORT_WA}?text=${SUPPORT_MSG}`;

function getPortugueseAuthMessage(error) {
  const rawMessage = error?.message || error?.toString?.() || '';
  const message = rawMessage.toLowerCase();

  if (message.includes('email not confirmed') || message.includes('user not confirmed') || message.includes('email_not_confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de confirmação antes de entrar.';
  }

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'E-mail ou senha inválidos. Verifique os dados e tente novamente.';
  }

  return '';
}

function hexToRgba(hex, alpha = 1) {
  const clean = (hex || '#000000').replace('#', '').trim();
  if (!clean) return `rgba(0, 0, 0, ${alpha})`;

  const expanded = clean.length === 3
    ? clean.split('').map(char => char + char).join('')
    : clean;

  const parsed = Number.parseInt(expanded, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function PasswordInput({ value, onChange, placeholder, className = '', style, required = false, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full p-3 rounded-xl text-sm focus:border-[var(--accent)] focus:outline-none pr-12 ${className}`.trim()}
        style={style}
      />
      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)]"
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 2l20 20" />
            <path d="M10.5 10.5A3 3 0 0 0 13.5 13.5" />
            <path d="M6.7 6.7A10.9 10.9 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.3-.9" />
            <path d="M9.2 4.2A10.9 10.9 0 0 1 12 3c6.5 0 10 7 10 7a17.2 17.2 0 0 1-3.4 4.3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function AdminPage() {
  // Session states
  const [store, setStore] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Authentication forms
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [authForm, setAuthForm] = useState({
    name: '',
    slug: '',
    whatsapp_number: '',
    owner_email: '',
    owner_password: '',
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Current Dashboard Tab
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'customize', 'settings'

  // Products and Categories states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);

  // Settings forms
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    whatsapp_number: '',
    pix_key: '',
    pix_name: '',
    pix_city: '',
    mp_access_token: '',
    payment_methods: 'whatsapp',
    logo_url: '',
    theme_font_family: 'Manrope',
    theme_primary_color: '#0F6E56',
    theme_secondary_color: '#132A46',
    theme_background_color: '#FAF9F6',
    theme_card_color: '#FFFFFF',
    theme_text_color: '#132A46',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: '',
    category: '',
    description: '',
    price: 0,
    img: '',
    images: [],
    tag: '',
    tag_color: '',
    emoji: '',
    gradient: '',
    has_img: false,
  });

  const [catForm, setCatForm] = useState({ id: null, name: '', slug: '', emoji: '' });

  // Mock Pix Subscription state
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [now] = useState(() => Date.now());
  const searchParams = useSearchParams();
  const subscriptionStatus = searchParams.get('subscription');

  const subscriptionMessage = useMemo(() => {
    if (checkoutMessage) return checkoutMessage;
    if (!subscriptionStatus) return '';
    if (subscriptionStatus === 'success') {
      return 'Assinatura concluída com sucesso! Atualizando o painel...';
    }
    if (subscriptionStatus === 'failure') {
      return 'Pagamento não aprovado. Tente novamente ou use outro método.';
    }
    return 'Pagamento pendente. Aguardando confirmação do Mercado Pago.';
  }, [checkoutMessage, subscriptionStatus]);

  const customizationPreviewStyle = useMemo(() => {
    const primary = settingsForm.theme_primary_color || '#0F6E56';
    const secondary = settingsForm.theme_secondary_color || '#132A46';
    const background = settingsForm.theme_background_color || '#FAF9F6';
    const card = settingsForm.theme_card_color || '#FFFFFF';
    const text = settingsForm.theme_text_color || '#132A46';
    const fontFamily = settingsForm.theme_font_family || 'Manrope';

    return {
      '--accent': primary,
      '--accent-hover': secondary,
      '--accent-bg': hexToRgba(primary, 0.12),
      '--bg-page': background,
      '--bg-card': card,
      '--bg-header': hexToRgba(card, 0.96),
      '--border-color': hexToRgba(text, 0.16),
      '--text-primary': text,
      '--text-secondary': hexToRgba(text, 0.72),
      '--text-muted': hexToRgba(text, 0.5),
      '--cart-bg': secondary,
      '--cart-text': '#ffffff',
      '--font-display': fontFamily,
      '--font-sans': fontFamily,
      backgroundColor: background,
      color: text,
      fontFamily,
    };
  }, [settingsForm]);

  const refreshStore = useCallback(async () => {
    if (!store?.slug) return;
    try {
      const url = `/api/stores?slug=${encodeURIComponent(store.slug)}`;
      const data = await fetchWithCache(url, { ttl: 2000 });
      if (!data || data.error) return;
      setStore(data);
      localStorage.setItem('saas_current_store', JSON.stringify(data));
    } catch (err) {
      console.error('[Admin] refreshStore failed', err);
    }
  }, [store]);

  const fetchCategories = useCallback(async () => {
    if (!store) return;
    try {
      const url = `/api/admin/categories?store_id=${store.id}`;
      const data = await fetchWithCache(url, { ttl: 2000 });
      if (!data || data.error) throw new Error(data?.error || 'Erro');
      setCategories(data || []);
      if (data?.length) {
        setForm(current => current.category ? current : ({ ...current, category: data[0].slug }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [store]);

  const fetchList = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/products?store_id=${store.id}`;
      const data = await fetchWithCache(url, { ttl: 2000 });
      if (!data || data.error) throw new Error(data?.error || 'Erro');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    if (subscriptionStatus !== 'success') {
      return;
    }
    const timeoutId = setTimeout(() => {
      refreshStore();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [subscriptionStatus, refreshStore]);

  useEffect(() => {
    if (!store?.id || !store.subscription_active) {
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchList();
      fetchCategories();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [store?.id, store?.subscription_active, fetchCategories, fetchList]);

  async function handleInstallPWA() {
    if (!installPrompt) {
      return;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
      }
      setInstallPrompt(null);
    } catch (err) {
      console.error('[Admin] PWA install failed', err);
    }
  }

  async function handleSubscriptionCheckout() {
    if (!store) return;
    setLoading(true);
    setCheckoutMessage('Redirecionando para Mercado Pago...');
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: store.id, store_slug: store.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao iniciar checkout de assinatura');
      window.location.href = data.init_point;
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const syncStandalone = () => setIsStandalone(Boolean(mediaQuery.matches));
    syncStandalone();

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncStandalone);
    } else {
      mediaQuery.addListener(syncStandalone);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncStandalone);
      } else {
        mediaQuery.removeListener(syncStandalone);
      }

      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    async function restoreSession() {
      try {
        let cachedStoreData = null;
        try {
          const cached = localStorage.getItem('saas_current_store');
          if (cached) {
            cachedStoreData = JSON.parse(cached);
          }
        } catch (cacheErr) {
          console.error('[Admin] failed to read cached store', cacheErr);
        }

        if (cachedStoreData) {
          setStore(cachedStoreData);
          setProducts([]);
          setCategories([]);
          setSettingsForm({
            name: cachedStoreData.name || '',
            description: cachedStoreData.description || '',
            whatsapp_number: cachedStoreData.whatsapp_number || '',
            pix_key: cachedStoreData.pix_key || '',
            pix_name: cachedStoreData.pix_name || '',
            pix_city: cachedStoreData.pix_city || '',
            mp_access_token: cachedStoreData.mp_access_token || '',
            payment_methods: cachedStoreData.payment_methods || 'whatsapp',
            logo_url: cachedStoreData.logo_url || '',
            theme_font_family: cachedStoreData.theme_font_family || 'Manrope',
            theme_primary_color: cachedStoreData.theme_primary_color || '#0F6E56',
            theme_secondary_color: cachedStoreData.theme_secondary_color || '#132A46',
            theme_background_color: cachedStoreData.theme_background_color || '#FAF9F6',
            theme_card_color: cachedStoreData.theme_card_color || '#FFFFFF',
            theme_text_color: cachedStoreData.theme_text_color || '#132A46',
          });
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data?.session;
        if (session?.user) {
          const userId = session.user.id;
          const email = session.user.email;
          let res = await fetch(`/api/stores?user_id=${encodeURIComponent(userId)}`);
          if (!res.ok) {
            res = await fetch(`/api/stores?email=${encodeURIComponent(email)}`);
          }
          const storeData = await res.json();
          if (!res.ok || storeData.error) {
            if (cachedStoreData) {
              setStore(cachedStoreData);
              setProducts([]);
              setCategories([]);
              setSettingsForm({
                name: cachedStoreData.name || '',
                description: cachedStoreData.description || '',
                whatsapp_number: cachedStoreData.whatsapp_number || '',
                pix_key: cachedStoreData.pix_key || '',
                pix_name: cachedStoreData.pix_name || '',
                pix_city: cachedStoreData.pix_city || '',
                mp_access_token: cachedStoreData.mp_access_token || '',
                payment_methods: cachedStoreData.payment_methods || 'whatsapp',
                logo_url: cachedStoreData.logo_url || '',
                theme_font_family: cachedStoreData.theme_font_family || 'Manrope',
                theme_primary_color: cachedStoreData.theme_primary_color || '#0F6E56',
                theme_secondary_color: cachedStoreData.theme_secondary_color || '#132A46',
                theme_background_color: cachedStoreData.theme_background_color || '#FAF9F6',
                theme_card_color: cachedStoreData.theme_card_color || '#FFFFFF',
                theme_text_color: cachedStoreData.theme_text_color || '#132A46',
              });
            }
            return;
          }
          setStore(storeData);
          setProducts([]);
          setCategories([]);
          localStorage.setItem('saas_current_store', JSON.stringify(storeData));
          setSettingsForm({
            name: storeData.name || '',
            description: storeData.description || '',
            whatsapp_number: storeData.whatsapp_number || '',
            pix_key: storeData.pix_key || '',
            pix_name: storeData.pix_name || '',
            pix_city: storeData.pix_city || '',
            mp_access_token: storeData.mp_access_token || '',
            payment_methods: storeData.payment_methods || 'whatsapp',
            logo_url: storeData.logo_url || '',
            theme_font_family: storeData.theme_font_family || 'Manrope',
            theme_primary_color: storeData.theme_primary_color || '#0F6E56',
            theme_secondary_color: storeData.theme_secondary_color || '#132A46',
            theme_background_color: storeData.theme_background_color || '#FAF9F6',
            theme_card_color: storeData.theme_card_color || '#FFFFFF',
            theme_text_color: storeData.theme_text_color || '#132A46',
          });
        }
      } catch (err) {
        console.error('[Admin] restoreSession failed', err);
      } finally {
        setSessionLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Keep settingsForm in sync when store data changes (covers other devices)
  useEffect(() => {
    if (!store) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettingsForm(prev => ({
      ...prev,
      name: store.name || prev.name,
      description: store.description || prev.description,
      whatsapp_number: store.whatsapp_number || prev.whatsapp_number,
      pix_key: store.pix_key || prev.pix_key,
      pix_name: store.pix_name || prev.pix_name,
      pix_city: store.pix_city || prev.pix_city,
      mp_access_token: store.mp_access_token || prev.mp_access_token,
      payment_methods: store.payment_methods || prev.payment_methods,
      logo_url: store.logo_url || prev.logo_url,
      theme_font_family: store.theme_font_family || prev.theme_font_family,
      theme_primary_color: store.theme_primary_color || prev.theme_primary_color,
      theme_secondary_color: store.theme_secondary_color || prev.theme_secondary_color,
      theme_background_color: store.theme_background_color || prev.theme_background_color,
      theme_card_color: store.theme_card_color || prev.theme_card_color,
      theme_text_color: store.theme_text_color || prev.theme_text_color,
    }));
  }, [store]);

  // When the user opens the Personalizar tab, refresh store data from server
  useEffect(() => {
    if (activeTab !== 'customize') return;
    // refreshStore uses store.slug; if not available, attempt to restore from localStorage
    (async () => {
      try {
        if (!store?.slug) {
          const cached = localStorage.getItem('saas_current_store');
          if (cached) {
            const s = JSON.parse(cached);
            setStore(s);
          }
        }
        await refreshStore();
      } catch (err) {
        console.error('[Admin] failed to refresh store on customize tab open', err);
      }
    })();
  }, [activeTab, refreshStore, store?.slug]);


  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setAuthError(''); setAuthInfo('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.owner_email,
        password: authForm.owner_password,
      });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        setAuthInfo('Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar no painel.');
        setAuthMode('login');
        return;
      }

      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: authForm.slug,
          name: authForm.name,
          description: '',
          whatsapp_number: authForm.whatsapp_number,
          owner_email: authForm.owner_email,
          auth_user_id: data.user.id,
        }),
      });

      const storeData = await res.json();
      if (!res.ok) {
        throw new Error(storeData?.error || 'Erro ao registrar loja.');
      }

      if (!data.session) {
        setAuthInfo('Cadastro realizado! Verifique seu e-mail para confirmar a conta e depois faça login no painel.');
        setAuthMode('login');
        setAuthForm(prev => ({ ...prev, owner_password: '' }));
        return;
      }

      setStore(storeData);
      setProducts([]);
      setCategories([]);
      localStorage.setItem('saas_current_store', JSON.stringify(storeData));
      setSettingsForm({
        name: storeData.name || '',
        description: storeData.description || '',
        whatsapp_number: storeData.whatsapp_number || '',
        pix_key: storeData.pix_key || '',
        pix_name: storeData.pix_name || '',
        pix_city: storeData.pix_city || '',
        mp_access_token: storeData.mp_access_token || '',
        payment_methods: storeData.payment_methods || 'whatsapp',
      });
    } catch (err) {
      const translatedMessage = getPortugueseAuthMessage(err);
      setAuthError(translatedMessage || err.message || 'Não foi possível criar a loja.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setAuthError(''); setAuthInfo('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.owner_email,
        password: authForm.owner_password,
      });

      if (error) {
        throw error;
      }

      const userId = data?.user?.id;
      if (!userId) {
        throw new Error('Não foi possível autenticar o usuário.');
      }

      let res = await fetch(`/api/stores?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        res = await fetch(`/api/stores?email=${encodeURIComponent(authForm.owner_email)}`);
      }

      const storeData = await res.json();
      if (!res.ok || storeData.error) {
        throw new Error(storeData?.error || 'Erro ao carregar os dados da loja.');
      }

      setStore(storeData);
      setProducts([]);
      setCategories([]);
      localStorage.setItem('saas_current_store', JSON.stringify(storeData));
      setSettingsForm({
        name: storeData.name || '',
        description: storeData.description || '',
        whatsapp_number: storeData.whatsapp_number || '',
        pix_key: storeData.pix_key || '',
        pix_name: storeData.pix_name || '',
        pix_city: storeData.pix_city || '',
        mp_access_token: storeData.mp_access_token || '',
        payment_methods: storeData.payment_methods || 'whatsapp',
      });
    } catch (err) {
      const translatedMessage = getPortugueseAuthMessage(err);
      setAuthError(translatedMessage || err.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true); setAuthError(''); setAuthInfo('');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const { data, error } = await supabase.auth.resetPasswordForEmail(authForm.owner_email, {
        redirectTo: `${baseUrl}/admin`,
      });
      if (error) throw error;
      setAuthInfo('E-mail de recuperação enviado. Verifique sua caixa de entrada.');
    } catch (err) {
      setAuthError(err.message || 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    localStorage.removeItem('saas_current_store');
    await supabase.auth.signOut();
    setStore(null);
    setProducts([]);
    setCategories([]);
    setActiveTab('products');
  }

  // Activate Subscription (Billing Mock Checkout)
  // Update Settings
  async function handleUpdateSettings(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: store.id,
          ...settingsForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar configurações');
      setStore(data);
      localStorage.setItem('saas_current_store', JSON.stringify(data));
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Form Handlers
  function resetForm() {
    setForm({
      id: null,
      name: '',
      category: categories?.[0]?.slug || '',
      description: '',
      price: 0,
      img: '',
      images: [],
      tag: '',
      tag_color: '',
      emoji: '',
      gradient: '',
      has_img: false,
    });
  }

  function edit(p) {
    setForm({
      ...p,
      price: Number(p.price || 0),
      images: Array.isArray(p.images) ? p.images : [],
    });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Erro ao enviar imagem');
    return data.url;
  }

  async function handleLogoUpload(e) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file);
      setSettingsForm(f => ({ ...f, logo_url: url }));
    } catch (err) {
      setError(err.message || 'Erro ao enviar logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/admin/products/${form.id}` : '/api/admin/products';
      const payload = {
        ...form,
        store_id: store.id,
        images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar');
      await fetchList();
      resetForm();
      setShowProductForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function moveProduct(id, direction) {
    if (!products?.length) return;
    const sorted = [...products].sort((a, b) => (a.position || 0) - (b.position || 0) || (a.id || 0) - (b.id || 0));
    const index = sorted.findIndex(p => p.id === id);
    if (index === -1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[swapIndex];
    const currentPosition = current.position ?? 0;
    const targetPosition = target.position ?? 0;

    setLoading(true);
    setError(null);
    try {
      const updateCurrent = await fetch(`/api/admin/products/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: targetPosition }),
      });
      const updateTarget = await fetch(`/api/admin/products/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: currentPosition }),
      });
      const currentData = await updateCurrent.json();
      const targetData = await updateTarget.json();
      if (!updateCurrent.ok) throw new Error(currentData?.error || 'Erro ao mover produto.');
      if (!updateTarget.ok) throw new Error(targetData?.error || 'Erro ao mover produto.');
      await fetchList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm('Confirma exclusão?')) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao excluir');
      await fetchList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetCatForm() {
    setCatForm({ id: null, name: '', slug: '', emoji: '' });
  }

  function editCategory(c) {
    setCatForm({ id: c.id, name: c.name, slug: c.slug, emoji: c.emoji });
    setShowCatForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitCategory(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const method = catForm.id ? 'PUT' : 'POST';
      const url = catForm.id ? `/api/admin/categories/${catForm.id}` : '/api/admin/categories';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...catForm, store_id: store.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar categoria');
      await fetchCategories();
      resetCatForm();
      setShowCatForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeCategory(id) {
    if (!confirm('Confirma exclusão da categoria?')) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao excluir categoria');
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addImageSlot() {
    setForm(f => ({ ...f, images: [...(f.images || []), ''] }));
  }

  function removeImageSlot(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function updateImageSlot(idx, val) {
    setForm(f => {
      const imgs = [...(f.images || [])];
      imgs[idx] = val;
      return { ...f, images: imgs };
    });
  }

  // Cálculo da avaliação gratuita de 30 dias (1 mês)
  const trialDurationMs = 30 * 24 * 60 * 60 * 1000;
  const timeDiff = store?.created_at ? (new Date() - new Date(store.created_at)) : 0;
  const isTrialActive = store?.created_at ? timeDiff < trialDurationMs : false;
  const remainingDays = store?.created_at ? Math.max(0, Math.ceil((trialDurationMs - timeDiff) / (1000 * 60 * 60 * 24))) : 0;

  // Subscription expiration countdown
  const subscriptionExpiresAt = store?.subscription_expires_at ? new Date(store.subscription_expires_at) : null;
  const remainingSubscriptionMs = subscriptionExpiresAt && now ? subscriptionExpiresAt.getTime() - now : 0;
  const remainingSubscriptionDays = subscriptionExpiresAt ? Math.max(0, Math.ceil(remainingSubscriptionMs / (1000 * 60 * 60 * 24))) : 0;
  const remainingSubscriptionText = subscriptionExpiresAt && remainingSubscriptionMs > 0 ? `${remainingSubscriptionDays} dias restantes` : null;

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="text-lg font-medium animate-pulse">Carregando painel administrativo...</div>
      </div>
    );
  }

  /* ─── Login & Register Screens ─────────────────────────────────── */
  if (!store) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mb-3 flex justify-center">
              <Image src="/prinzo_icon.svg" alt="Prinzo" width={64} height={64} className="rounded-full" />
            </div>
            <h1 className="text-2xl font-black mt-2">Painel do Lojista</h1>
            <p className="text-[var(--text-secondary)] text-xs mt-1">Configure seus produtos, categorias e Pix direto</p>
          </div>

          <div className="flex bg-[var(--bg-header)] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthInfo(''); }}
              className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
              style={{
                backgroundColor: authMode === 'login' ? 'var(--accent)' : 'transparent',
                color: authMode === 'login' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthInfo(''); }}
              className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
              style={{
                backgroundColor: authMode === 'register' ? 'var(--accent)' : 'transparent',
                color: authMode === 'register' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              Criar Loja
            </button>
          </div>

          {authError && (
            <div className="text-xs p-3 rounded-xl mb-4 text-center" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)', color: '#B91C1C' }}>
              {authError}
            </div>
          )}
          {authInfo && (
            <div className="text-xs p-3 rounded-xl mb-4 text-center" style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
              {authInfo}
            </div>
          )}

          {isStandalone ? (
            <div className="rounded-2xl border p-3 mb-4 text-center text-xs" style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--border-color)', color: 'var(--accent)' }}>
              App instalado com sucesso.
            </div>
          ) : (
            <div className="rounded-2xl border p-3 mb-4 text-center" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={handleInstallPWA}
                disabled={!installPrompt}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-opacity"
                style={{ backgroundColor: installPrompt ? 'var(--accent)' : 'var(--border-color)', color: installPrompt ? '#ffffff' : 'var(--text-secondary)' }}
              >
                {installPrompt ? 'Instalar como app' : 'Instalar como app'}
              </button>
              <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {installPrompt
                  ? 'Instale o painel como aplicativo no seu celular.'
                  : 'Em iPhone, use o botão de compartilhamento e escolha “Adicionar à Tela de Início”.'}
              </p>
            </div>
          )}

          <form
            onSubmit={authMode === 'register' ? handleRegister : authMode === 'forgot' ? handleForgotPassword : handleLogin}
            className="space-y-4"
          >
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minha Loja de Decoração"
                    value={authForm.name}
                    onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-[var(--bg-header)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Link Exclusivo (slug da URL)</label>
                  <div className="flex items-center">
                    <span className="bg-[var(--bg-header)] border border-[var(--border-color)] border-r-0 px-3 py-3 rounded-l-xl text-[var(--text-secondary)] text-sm">prinzo.com/</span>
                    <input
                      type="text"
                      required
                      placeholder="minhaloja"
                      value={authForm.slug}
                      onChange={e => setAuthForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      className="w-full p-3 rounded-r-xl bg-[var(--bg-header)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">WhatsApp para Vendas</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5598984809302"
                    value={authForm.whatsapp_number}
                    onChange={e => setAuthForm(f => ({ ...f, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full p-3 rounded-xl bg-[var(--bg-header)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
              <input
                type="email"
                required
                placeholder="Ex: lojista@exemplo.com"
                value={authForm.owner_email}
                onChange={e => setAuthForm(f => ({ ...f, owner_email: e.target.value }))}
                className="w-full p-3 rounded-xl text-sm focus:border-[var(--accent)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Senha</label>
                <PasswordInput
                  required
                  placeholder="Sua senha"
                  value={authForm.owner_password}
                  onChange={e => setAuthForm(f => ({ ...f, owner_password: e.target.value }))}
                  className=""
                  style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthInfo(''); }}
                  className="underline transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold transition-colors text-sm shadow-lg"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              {loading
                ? 'Processando...'
                : authMode === 'register'
                ? 'Criar Minha Loja 🚀'
                : authMode === 'forgot'
                ? 'Enviar E-mail de Recuperação'
                : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* ─── Inactive Subscription / Billing Screen ───────────────────── */
  if (!store.subscription_active && !isTrialActive) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
        <div className="rounded-3xl p-8 shadow-2xl text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          <span className="text-5xl mb-3 inline-block">👑</span>
          <h2 className="text-2xl font-black mb-1">Período de Avaliação Encerrado</h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>Assine agora para continuar vendendo! Você já testou durante 1 mês.</p>

          <div className="p-4 rounded-2xl mb-6 text-left" style={{ backgroundColor: 'var(--bg-header)' }}>
            <span className="text-xs uppercase font-extrabold tracking-wider" style={{ color: 'var(--accent)' }}>Plano Completo</span>
            <div className="text-3xl font-black my-2">R$ 20,00 <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/mês</span></div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Libera seu catálogo online com vendas ilimitadas via Pix e WhatsApp.</p>
          </div>

          <div className="space-y-4">
            {subscriptionMessage && (
              <div className="p-4 rounded-2xl text-sm" style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                {subscriptionMessage}
              </div>
            )}
            <button
              onClick={handleSubscriptionCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm hover:opacity-95"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff', boxShadow: '0 12px 24px rgba(19, 42, 70, 0.14)' }}
            >
              {loading ? 'Redirecionando...' : 'Assinar com Mercado Pago'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs block mx-auto mt-4 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ─── Active Dashboard ─────────────────────────────────────────── */
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
      {/* Alerta de Período de Testes */}
      {!store.subscription_active && isTrialActive && (
        <div className="text-xs p-3 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md" style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
          <div>
            <strong>🔥 Modo de Avaliação Gratuita Ativo!</strong> Restam <strong>{remainingDays} dias</strong> de teste para seu catálogo.
          </div>
          <button
            onClick={handleSubscriptionCheckout}
            className="px-4 py-1.5 rounded-xl font-bold transition-colors text-[11px]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-page)' }}
          >
            Assinar com Mercado Pago
          </button>
        </div>
      )}

      

      {/* Header Info */}
      <div className="border-b pb-4 mb-8" style={{ borderColor: 'var(--border-color)' }}>
        {/* Top Row: Store name + link + logout/theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="min-w-0 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black truncate" style={{ color: 'var(--text-primary)' }}>{store.name}</h1>
              {store.subscription_active ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>Ativo</span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)', color: '#ffffff' }}>Avaliação</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold inline-block max-w-full truncate" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                  prinzo.com/{store.slug}
                </a>
              </p>
              {store.subscription_active && remainingSubscriptionText ? (
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Plano ativo — <strong>{remainingSubscriptionText}</strong>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-black transition-colors"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Tab Navigation Row: wraps on mobile for smaller screens */}
        <div className="flex flex-wrap gap-2 justify-center pb-1 w-full">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 whitespace-normal sm:whitespace-nowrap ${activeTab === 'products' ? 'shadow-lg' : ''}`}
            style={{
              backgroundColor: activeTab === 'products' ? 'var(--accent)' : 'var(--bg-header)',
              color: activeTab === 'products' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            📦 Produtos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 whitespace-normal sm:whitespace-nowrap ${activeTab === 'categories' ? 'shadow-lg' : ''}`}
            style={{
              backgroundColor: activeTab === 'categories' ? 'var(--accent)' : 'var(--bg-header)',
              color: activeTab === 'categories' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            🗂️ Categorias
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 whitespace-normal sm:whitespace-nowrap ${activeTab === 'customize' ? 'shadow-lg' : ''}`}
            style={{
              backgroundColor: activeTab === 'customize' ? 'var(--accent)' : 'var(--bg-header)',
              color: activeTab === 'customize' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            🎨 Personalizar
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 whitespace-normal sm:whitespace-nowrap ${activeTab === 'settings' ? 'shadow-lg' : ''}`}
            style={{
              backgroundColor: activeTab === 'settings' ? 'var(--accent)' : 'var(--bg-header)',
              color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            ⚙️ Configurações
          </button>
        </div>
      </div>

      {/* ─── CUSTOMIZE TAB (moved below header to match other tabs) ─────────────────────────────────────── */}
      {activeTab === 'customize' && (
        <section className="max-w-2xl">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Personalizar Catálogo</h2>

          <form className="space-y-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 mb-6 shadow-2xl">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Logo da Loja</label>
                  <div className="flex items-center gap-3">
                    {settingsForm.logo_url ? (
                      <img src={settingsForm.logo_url} alt="Logo" className="w-28 h-20 object-contain rounded-md border" style={{ borderColor: 'var(--border-color)' }} />
                    ) : (
                      <div className="w-28 h-20 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--bg-header)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Sem logo</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <input type="file" className="w-full min-w-0" accept="image/*" onChange={handleLogoUpload} />
                      <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{uploadingLogo ? 'Enviando...' : 'PNG/JPG/WebP — até 5MB'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Nome da Loja</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.name}
                      onChange={e => setSettingsForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full p-3 rounded-xl border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Descrição / Slogan</label>
                    <input
                      type="text"
                      value={settingsForm.description}
                      onChange={e => setSettingsForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full p-3 rounded-xl border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>WhatsApp para Vendas</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsapp_number}
                      onChange={e => setSettingsForm(f => ({ ...f, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="w-full p-3 rounded-xl border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Fonte</label>
                    <select value={settingsForm.theme_font_family} onChange={e => setSettingsForm(f => ({ ...f, theme_font_family: e.target.value }))} className="w-full p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      <option value="Manrope">Manrope</option>
                      <option value="Sora">Sora</option>
                      <option value="Inter">Inter</option>
                      <option value="System">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Cor Primária</label>
                    <input type="color" value={settingsForm.theme_primary_color} onChange={e => setSettingsForm(f => ({ ...f, theme_primary_color: e.target.value }))} className="w-full h-10 p-1 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Cor Secundária</label>
                    <input type="color" value={settingsForm.theme_secondary_color} onChange={e => setSettingsForm(f => ({ ...f, theme_secondary_color: e.target.value }))} className="w-full h-10 p-1 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Fundo da Página</label>
                    <input type="color" value={settingsForm.theme_background_color} onChange={e => setSettingsForm(f => ({ ...f, theme_background_color: e.target.value }))} className="w-full h-10 p-1 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Cor dos Cards</label>
                    <input type="color" value={settingsForm.theme_card_color} onChange={e => setSettingsForm(f => ({ ...f, theme_card_color: e.target.value }))} className="w-full h-10 p-1 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Cor do Texto</label>
                    <input type="color" value={settingsForm.theme_text_color} onChange={e => setSettingsForm(f => ({ ...f, theme_text_color: e.target.value }))} className="w-full h-10 p-1 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={handleUpdateSettings} className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>Salvar Personalização</button>
                  <button type="button" onClick={() => setSettingsForm(f => ({ ...f,
                    logo_url: '',
                    theme_font_family: 'Manrope',
                    theme_primary_color: '#0F6E56',
                    theme_secondary_color: '#132A46',
                    theme_background_color: '#FAF9F6',
                    theme_card_color: '#FFFFFF',
                    theme_text_color: '#132A46',
                  }))} className="px-5 py-2.5 rounded-xl border text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Resetar</button>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl">
              <div style={customizationPreviewStyle} className="p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  {settingsForm.logo_url ? (
                    <img src={settingsForm.logo_url} alt="logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-[var(--bg-card)]" />
                  )}
                  <div>
                    <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>LJVision</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Coleção exclusiva de produtos personalizados</div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="h-36 rounded-md mb-3" style={{ background: 'linear-gradient(135deg, var(--accent-bg), var(--card))' }} />
                  <div className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Produto Exemplo</div>
                  <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Descrição curta de demonstração</div>
                  <div className="inline-flex items-center gap-3">
                    <div className="px-3 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>R$ 49,90</div>
                    <div className="px-3 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--bg-header)', border: '1px solid var(--border-color)' }}>Comprar</div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      )}

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-2xl mb-6 text-sm">{error}</div>}

      {/* ─── PRODUCTS TAB ────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Meus Produtos</h2>
            <button
              onClick={() => { resetForm(); setShowProductForm(!showProductForm); }}
              className="px-4 py-2 rounded-xl text-xs font-bold"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)' }}
            >
              {showProductForm ? '✕ Cancelar' : '+ Cadastrar Produto'}
            </button>
          </div>

          {showProductForm && (
            <form onSubmit={submit} className="space-y-4 p-6 rounded-2xl border mb-8" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Nome do Produto</label>
                  <input placeholder="Ex: Mascote do Flamengo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                <textarea placeholder="Descrição do produto..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Preço (R$)</label>
                  <input type="number" step="0.01" placeholder="Ex: 29.90" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value || 0) }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Imagem Principal (URL)</label>
                  <input placeholder="https://..." value={form.img} onChange={e => setForm(f => ({ ...f, img: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Upload de Imagem</label>
                  <label className="w-full p-2.5 rounded-xl border flex items-center justify-center cursor-pointer text-xs transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    Clique para selecionar imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setLoading(true);
                        try {
                          const url = await uploadFile(file);
                          setForm(prev => ({ ...prev, img: url, has_img: true }));
                        } catch (err) {
                          alert(err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {form.img && (
                <div className="flex items-center gap-3 p-2 rounded-xl w-fit" style={{ backgroundColor: 'var(--bg-header)' }}>
                  <div className="relative w-16 h-12 rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <Image src={form.img} alt="preview" fill style={{ objectFit: 'contain' }} />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Visualização da Imagem</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Tag (opcional)</label>
                  <input placeholder="Ex: Lançamento" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Cor da Tag (tailwind)</label>
                  <input placeholder="Ex: bg-rose-600" value={form.tag_color} onChange={e => setForm(f => ({ ...f, tag_color: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Emoji Alternativo</label>
                  <input placeholder="Ex: 🏆" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>{form.id ? 'Atualizar' : 'Salvar Produto'}</button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Limpar</button>
              </div>
            </form>
          )}

          {loading && products.length === 0 ? (
            <div>Carregando lista de produtos...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map(p => (
                <div key={p.id} className="flex flex-col gap-3 p-4 rounded-2xl border sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-12 flex items-center justify-center rounded-xl overflow-hidden border shrink-0" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      {p.img ? (
                        <div className="relative w-full h-full">
                          <Image src={p.img} alt={p.name} fill style={{ objectFit: 'contain' }} />
                        </div>
                      ) : <span className="text-xl">{p.emoji}</span>}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {p.category} — R$ {Number(p.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveProduct(p.id, 'up')}
                        className="px-3 py-1.5 rounded-lg border text-xs min-w-[2.2rem]"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        disabled={products.findIndex(item => item.id === p.id) === 0}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveProduct(p.id, 'down')}
                        className="px-3 py-1.5 rounded-lg border text-xs min-w-[2.2rem]"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        disabled={products.findIndex(item => item.id === p.id) === products.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => edit(p)} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Editar</button>
                      <button onClick={() => remove(p.id)} className="px-3 py-1.5 rounded-lg transition-all text-xs hover:bg-rose-600 hover:text-white" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#ef4444' }}>Excluir</button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhum produto cadastrado.</div>}
            </div>
          )}
        </section>
      )}

      {/* ─── CATEGORIES TAB ──────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Minhas Categorias</h2>
            <button
              onClick={() => { resetCatForm(); setShowCatForm(!showCatForm); }}
              className="px-4 py-2 rounded-xl text-xs font-bold"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-page)' }}
            >
              {showCatForm ? '✕ Cancelar' : '+ Cadastrar Categoria'}
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={submitCategory} className="space-y-4 p-6 rounded-2xl border mb-8" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Nome</label>
                  <input placeholder="Ex: Decorativos" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Slug identificador</label>
                  <input placeholder="Ex: decorativos" value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Emoji representativo</label>
                  <input placeholder="Ex: ✨" value={catForm.emoji} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} className="w-full p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>{catForm.id ? 'Atualizar' : 'Salvar Categoria'}</button>
                <button type="button" onClick={resetCatForm} className="px-5 py-2.5 rounded-xl border text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Limpar</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-3">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{c.emoji}</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.slug}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCategory(c)} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Editar</button>
                  <button onClick={() => removeCategory(c.id)} className="px-3 py-1.5 rounded-lg transition-all text-xs hover:bg-rose-600 hover:text-white" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#ef4444' }}>Excluir</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma categoria cadastrada.</div>}
          </div>
        </section>
      )}

      {/* ─── SETTINGS TAB ────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <section className="max-w-2xl">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Configurações da Loja</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div className="border-t pt-4 mt-6" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-md font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Integração Pix Direto (Recebimento sem Intermediários)</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Insira os dados do seu Pix para permitir que seus clientes paguem por Pix na loja e copiem o código/QR code.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Chave Pix</label>
                  <input
                    type="text"
                    placeholder="Chave Pix (Celular, E-mail, CPF, Chave Aleatória)"
                    value={settingsForm.pix_key}
                    onChange={e => setSettingsForm(f => ({ ...f, pix_key: e.target.value }))}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Nome do Titular do Pix</label>
                  <input
                    type="text"
                    placeholder="Nome igual cadastrado no banco"
                    value={settingsForm.pix_name}
                    onChange={e => setSettingsForm(f => ({ ...f, pix_name: e.target.value }))}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Cidade do Titular</label>
                <input
                  type="text"
                  placeholder="Ex: Sao Paulo"
                  value={settingsForm.pix_city}
                  onChange={e => setSettingsForm(f => ({ ...f, pix_city: e.target.value }))}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-md font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Integração Mercado Pago</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Insira o seu Access Token do Mercado Pago para permitir pagamentos online com cartão, Pix do MP, e outros métodos. Obtenha em: <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--accent)' }}>mercadopago.com.br/developers</a></p>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Access Token (MP_ACCESS_TOKEN)</label>
                <PasswordInput
                  placeholder="APP_USR-..."
                  value={settingsForm.mp_access_token}
                  onChange={e => setSettingsForm(f => ({ ...f, mp_access_token: e.target.value }))}
                  className="font-mono"
                  style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Seu token é guardado com segurança e utilizado apenas para criar preferências de pagamento da sua loja.</p>
              </div>
            </div>

            <div className="border-t pt-4 mt-6" style={{ borderColor: 'var(--border-color)' }}>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Meios de Pagamento Disponíveis na Loja</label>
              <select
                value={settingsForm.payment_methods}
                onChange={e => setSettingsForm(f => ({ ...f, payment_methods: e.target.value }))}
                className="w-full p-3 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="whatsapp">Apenas Encomendar via WhatsApp</option>
                <option value="pix_direct">Apenas Pix Direto com QR Code</option>
                <option value="mercadopago">Apenas Mercado Pago</option>
                <option value="both">Pix Direto + WhatsApp</option>
                <option value="all">Todos (Pix Direto, Mercado Pago e WhatsApp)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold shadow-lg text-xs"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>

          {/* Suporte */}
          <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-md font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Precisa de Ajuda?</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Nossa equipe está pronta para te ajudar com qualquer dúvida sobre o Prinzo.</p>
            <a
              href={SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
              Falar com Suporte via WhatsApp
            </a>
          </div>
        </section>
      )}

    </main>
  );
}
