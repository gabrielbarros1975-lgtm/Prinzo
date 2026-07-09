'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ThemeToggle } from '@/components/ThemeToggle';

const SUPPORT_WA = '5598984809302';
const SUPPORT_MSG = encodeURIComponent('Olá! Preciso de suporte com o Prinzo.');
const SUPPORT_LINK = `https://wa.me/${SUPPORT_WA}?text=${SUPPORT_MSG}`;

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

  // Current Dashboard Tab
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'settings'

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
  });

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
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('subscription');
    if (!status) return;

    if (status === 'success') {
      setSubscriptionMessage('Assinatura concluída com sucesso! Atualizando o painel...');
      refreshStore();
    } else if (status === 'failure') {
      setSubscriptionMessage('Pagamento não aprovado. Tente novamente ou use outro método.');
    } else if (status === 'pending') {
      setSubscriptionMessage('Pagamento pendente. Aguardando confirmação do Mercado Pago.');
    }
  }, [searchParams]);

  async function refreshStore() {
    if (!store?.slug) return;
    try {
      const res = await fetch(`/api/stores?slug=${encodeURIComponent(store.slug)}`);
      const data = await res.json();
      if (!res.ok || data.error) return;
      setStore(data);
      localStorage.setItem('saas_current_store', JSON.stringify(data));
    } catch (err) {
      console.error('[Admin] refreshStore failed', err);
    }
  }

  async function handleSubscriptionCheckout() {
    if (!store) return;
    setLoading(true);
    setSubscriptionMessage('Redirecionando para Mercado Pago...');
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
    async function restoreSession() {
      try {
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
            setSessionLoading(false);
            return;
          }
          setStore(storeData);
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
        }
      } catch (err) {
        console.error('[Admin] restoreSession failed', err);
      } finally {
        setSessionLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Fetch Lists when store changes or tab changes
  useEffect(() => {
    if (store && store.subscription_active) {
      fetchList();
      fetchCategories();
    }
  }, [store]);

  async function fetchCategories() {
    if (!store) return;
    try {
      const res = await fetch(`/api/admin/categories?store_id=${store.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro');
      setCategories(data || []);
      if (!form.category && data?.length) setForm(f => ({ ...f, category: data[0].slug }));
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchList() {
    if (!store) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/products?store_id=${store.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  // Auth Handlers
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

      const userId = data.user?.id;
      let res = await fetch(`/api/stores?user_id=${encodeURIComponent(userId)}`);
      let storeData = await res.json();
      if (!res.ok) {
        const emailRes = await fetch(`/api/stores?email=${encodeURIComponent(authForm.owner_email)}`);
        res = emailRes;
        storeData = await emailRes.json();
        if (!emailRes.ok) {
          throw new Error('Loja não encontrada para este e-mail.');
        }
      }
      if (!res.ok || storeData.error) {
        throw new Error('Loja não encontrada para este e-mail.');
      }

      setStore(storeData);
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
      setAuthError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

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

      if (!data.user) {
        setAuthInfo('Confirmação de e-mail enviada. Verifique sua caixa de entrada antes de entrar.');
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

      setStore(storeData);
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
      setAuthError(err.message);
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

  // Cálculo da avaliação gratuita de 5 dias
  const trialDurationMs = 5 * 24 * 60 * 60 * 1000;
  const timeDiff = store?.created_at ? (new Date() - new Date(store.created_at)) : 0;
  const isTrialActive = store?.created_at ? timeDiff < trialDurationMs : false;
  const remainingDays = store?.created_at ? Math.max(0, Math.ceil((trialDurationMs - timeDiff) / (1000 * 60 * 60 * 24))) : 0;

  // Subscription expiration countdown
  const subscriptionExpiresAt = store?.subscription_expires_at ? new Date(store.subscription_expires_at) : null;
  const remainingSubscriptionMs = subscriptionExpiresAt ? subscriptionExpiresAt.getTime() - Date.now() : 0;
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
      <main className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center relative">
        {/* Floating Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-4xl">🚀</span>
            <h1 className="text-2xl font-black mt-2">Painel do Lojista</h1>
            <p className="text-slate-400 text-xs mt-1">Configure seus produtos, categorias e Pix direto</p>
          </div>

          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthInfo(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthInfo(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              Criar Loja
            </button>
          </div>

          {authError && (
            <div className="bg-rose-950/40 border border-rose-900 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center">
              {authError}
            </div>
          )}
          {authInfo && (
            <div className="bg-cyan-950/40 border border-cyan-800 text-cyan-200 text-xs p-3 rounded-xl mb-4 text-center">
              {authInfo}
            </div>
          )}

          <form
            onSubmit={authMode === 'register' ? handleRegister : authMode === 'forgot' ? handleForgotPassword : handleLogin}
            className="space-y-4"
          >
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minha Loja de Decoração"
                    value={authForm.name}
                    onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Link Exclusivo (slug da URL)</label>
                  <div className="flex items-center">
                    <span className="bg-slate-800 border border-slate-700 border-r-0 px-3 py-3 rounded-l-xl text-slate-500 text-sm">prinzo.com/</span>
                    <input
                      type="text"
                      required
                      placeholder="minhaloja"
                      value={authForm.slug}
                      onChange={e => setAuthForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      className="w-full p-3 rounded-r-xl bg-slate-800 border border-slate-700 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp para Vendas</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5598984809302"
                    value={authForm.whatsapp_number}
                    onChange={e => setAuthForm(f => ({ ...f, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">E-mail</label>
              <input
                type="email"
                required
                placeholder="Ex: lojista@exemplo.com"
                value={authForm.owner_email}
                onChange={e => setAuthForm(f => ({ ...f, owner_email: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Sua senha"
                  value={authForm.owner_password}
                  onChange={e => setAuthForm(f => ({ ...f, owner_password: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="text-right text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthInfo(''); }}
                  className="underline text-slate-300 hover:text-white"
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 transition-colors text-sm text-white shadow-lg"
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
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 shadow-2xl text-center">
          <span className="text-5xl mb-3 inline-block">👑</span>
          <h2 className="text-2xl font-black mb-1">Período de Teste Expirado</h2>
          <p className="text-slate-400 text-xs mb-6">Ative seu plano para colocar seu catálogo online de volta e continuar vendendo.</p>

          <div className="bg-slate-800 p-4 rounded-2xl mb-6 text-left">
            <span className="text-xs uppercase font-extrabold text-cyan-500 tracking-wider">Assinatura Premium</span>
            <div className="text-3xl font-black my-2">R$ 1,00 <span className="text-xs font-normal text-slate-400">no 1º mês</span></div>
            <p className="text-xs text-slate-400">Depois R$ 15,00/mês fixo. Libera acesso total e vendas no Mercado Pago e WhatsApp.</p>
          </div>

          <div className="space-y-4">
            {subscriptionMessage && (
              <div className="bg-cyan-950/30 border border-cyan-800 text-cyan-100 p-4 rounded-2xl text-sm">
                {subscriptionMessage}
              </div>
            )}
            <button
              onClick={handleSubscriptionCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-lg"
            >
              {loading ? 'Redirecionando...' : 'Assinar com Mercado Pago'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-slate-400 block mx-auto mt-4"
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
        <div className="bg-cyan-950/40 border border-cyan-800 text-cyan-400 text-xs p-3 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
          <div>
            <strong>🔥 Modo de Avaliação Gratuita Ativo!</strong> Restam <strong>{remainingDays} dias</strong> de teste para seu catálogo.
          </div>
          <button
            onClick={handleSubscriptionCheckout}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-colors text-[11px]"
          >
            Assinar com Mercado Pago
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
        {/* Top Row: Store name + link + logout/theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="min-w-0 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">{store.name}</h1>
              {store.subscription_active ? (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">Ativo</span>
              ) : (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">Avaliação</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 font-semibold hover:underline inline-block max-w-full truncate">
                  prinzo.com/{store.slug}
                </a>
              </p>
              {store.subscription_active && remainingSubscriptionText ? (
                <p className="text-xs text-emerald-400 dark:text-emerald-300">
                  Plano ativo — <strong>{remainingSubscriptionText}</strong>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-black bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Tab Navigation Row: wraps on mobile for smaller screens */}
        <div className="flex flex-wrap gap-2 justify-center pb-1 w-full">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 ${activeTab === 'products' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} whitespace-normal sm:whitespace-nowrap`}
          >
            📦 Produtos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 ${activeTab === 'categories' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} whitespace-normal sm:whitespace-nowrap`}
          >
            🗂️ Categorias
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-black text-center transition-all shrink-0 min-w-[96px] sm:min-w-0 ${activeTab === 'settings' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} whitespace-normal sm:whitespace-nowrap`}
          >
            ⚙️ Configurações
          </button>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-2xl mb-6 text-sm">{error}</div>}

      {/* ─── PRODUCTS TAB ────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Meus Produtos</h2>
            <button
              onClick={() => { resetForm(); setShowProductForm(!showProductForm); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold"
            >
              {showProductForm ? '✕ Cancelar' : '+ Cadastrar Produto'}
            </button>
          </div>

          {showProductForm && (
            <form onSubmit={submit} className="space-y-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Produto</label>
                  <input placeholder="Ex: Mascote do Flamengo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900">
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label>
                <textarea placeholder="Descrição do produto..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" placeholder="Ex: 29.90" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value || 0) }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Imagem Principal (URL)</label>
                  <input placeholder="https://..." value={form.img} onChange={e => setForm(f => ({ ...f, img: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Upload de Imagem</label>
                  <label className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
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
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl w-fit">
                  <img src={form.img} alt="preview" className="w-16 h-12 object-contain rounded bg-white" />
                  <span className="text-xs text-slate-400">Visualização da Imagem</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tag (opcional)</label>
                  <input placeholder="Ex: Lançamento" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cor da Tag (tailwind)</label>
                  <input placeholder="Ex: bg-rose-600" value={form.tag_color} onChange={e => setForm(f => ({ ...f, tag_color: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Emoji Alternativo</label>
                  <input placeholder="Ex: 🏆" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-xs">{form.id ? 'Atualizar' : 'Salvar Produto'}</button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border dark:border-slate-800 text-xs">Limpar</button>
              </div>
            </form>
          )}

          {loading && products.length === 0 ? (
            <div>Carregando lista de produtos...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-white flex items-center justify-center rounded-xl overflow-hidden border dark:border-slate-800">
                      {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-contain" /> : <span className="text-xl">{p.emoji}</span>}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        {p.category} — R$ {Number(p.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => edit(p)} className="px-3 py-1.5 rounded-lg border dark:border-slate-800 text-xs">Editar</button>
                    <button onClick={() => remove(p.id)} className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-all text-xs">Excluir</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="text-slate-400 text-center py-8">Nenhum produto cadastrado.</div>}
            </div>
          )}
        </section>
      )}

      {/* ─── CATEGORIES TAB ──────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Minhas Categorias</h2>
            <button
              onClick={() => { resetCatForm(); setShowCatForm(!showCatForm); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold"
            >
              {showCatForm ? '✕ Cancelar' : '+ Cadastrar Categoria'}
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={submitCategory} className="space-y-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nome</label>
                  <input placeholder="Ex: Decorativos" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Slug identificador</label>
                  <input placeholder="Ex: decorativos" value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Emoji representativo</label>
                  <input placeholder="Ex: ✨" value={catForm.emoji} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-xs">{catForm.id ? 'Atualizar' : 'Salvar Categoria'}</button>
                <button type="button" onClick={resetCatForm} className="px-5 py-2.5 rounded-xl border dark:border-slate-800 text-xs">Limpar</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-3">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{c.emoji}</div>
                  <div>
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.slug}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCategory(c)} className="px-3 py-1.5 rounded-lg border dark:border-slate-800 text-xs">Editar</button>
                  <button onClick={() => removeCategory(c.id)} className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-all text-xs">Excluir</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <div className="text-slate-400 text-center py-8">Nenhuma categoria cadastrada.</div>}
          </div>
        </section>
      )}

      {/* ─── SETTINGS TAB ────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <section className="max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Configurações da Loja</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nome da Loja</label>
              <input
                type="text"
                required
                value={settingsForm.name}
                onChange={e => setSettingsForm(f => ({ ...f, name: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Descrição / Slogan</label>
              <input
                type="text"
                value={settingsForm.description}
                onChange={e => setSettingsForm(f => ({ ...f, description: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp para Vendas</label>
              <input
                type="text"
                required
                value={settingsForm.whatsapp_number}
                onChange={e => setSettingsForm(f => ({ ...f, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') }))}
                className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              <h3 className="text-md font-bold mb-2">Integração Pix Direto (Recebimento sem Intermediários)</h3>
              <p className="text-xs text-slate-400 mb-4">Insira os dados do seu Pix para permitir que seus clientes paguem por Pix na loja e copiem o código/QR code.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Chave Pix</label>
                  <input
                    type="text"
                    placeholder="Chave Pix (Celular, E-mail, CPF, Chave Aleatória)"
                    value={settingsForm.pix_key}
                    onChange={e => setSettingsForm(f => ({ ...f, pix_key: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Titular do Pix</label>
                  <input
                    type="text"
                    placeholder="Nome igual cadastrado no banco"
                    value={settingsForm.pix_name}
                    onChange={e => setSettingsForm(f => ({ ...f, pix_name: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-400 mb-1">Cidade do Titular</label>
                <input
                  type="text"
                  placeholder="Ex: Sao Paulo"
                  value={settingsForm.pix_city}
                  onChange={e => setSettingsForm(f => ({ ...f, pix_city: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              <h3 className="text-md font-bold mb-2">Integração Mercado Pago</h3>
              <p className="text-xs text-slate-400 mb-4">Insira o seu Access Token do Mercado Pago para permitir pagamentos online com cartão, Pix do MP, e outros métodos. Obtenha em: <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noreferrer" className="text-cyan-500 underline">mercadopago.com.br/developers</a></p>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Access Token (MP_ACCESS_TOKEN)</label>
                <input
                  type="password"
                  placeholder="APP_USR-..."
                  value={settingsForm.mp_access_token}
                  onChange={e => setSettingsForm(f => ({ ...f, mp_access_token: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Seu token é guardado com segurança e utilizado apenas para criar preferências de pagamento da sua loja.</p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              <label className="block text-xs font-bold text-slate-400 mb-1">Meios de Pagamento Disponíveis na Loja</label>
              <select
                value={settingsForm.payment_methods}
                onChange={e => setSettingsForm(f => ({ ...f, payment_methods: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
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
              className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-white shadow-lg text-xs"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>

          {/* Suporte */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-md font-bold mb-1">Precisa de Ajuda?</h3>
            <p className="text-xs text-slate-400 mb-4">Nossa equipe está pronta para te ajudar com qualquer dúvida sobre o Prinzo.</p>
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
