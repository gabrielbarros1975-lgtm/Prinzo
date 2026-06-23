'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: '',
    category: '',
    description: '',
    price: 0,
    img: '',
    tag: '',
    tag_color: '',
    emoji: '',
    gradient: '',
    has_img: false,
  });

  const [catForm, setCatForm] = useState({ id: null, name: '', slug: '', emoji: '' });

  useEffect(() => { fetchList(); fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro');
      setCategories(data || []);
      if (!form.category && data?.length) setForm(f => ({ ...f, category: data[0].slug }));
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchList() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  function resetForm() {
    setForm({
      id: null,
      name: '',
      category: categories?.[0]?.slug || '',
      description: '',
      price: 0,
      img: '',
      tag: '',
      tag_color: '',
      emoji: '',
      gradient: '',
      has_img: false,
    });
  }

  function edit(p) {
    setForm({ ...p, price: Number(p.price || 0) });
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
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar');
      await fetchList();
      resetForm();
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
        body: JSON.stringify(catForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar categoria');
      await fetchCategories();
      resetCatForm();
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

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Admin — Catálogo (não aparece no navbar)</h1>

      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Gerenciar Catálogos</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Cadastre, edite e exclua categorias como Mascotes, Decorativos e Copa do Mundo.</p>
          </div>
          <button type="button" onClick={() => setShowCatForm(prev => !prev)} className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
            {showCatForm ? 'Ocultar cadastro' : 'Cadastrar categoria'}
          </button>
        </div>

        {showCatForm && (
          <form onSubmit={submitCategory} className="space-y-3 p-4 rounded border border-slate-200 bg-slate-50 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Nome" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" required />
              <input placeholder="Slug (identificador)" value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" required />
              <input placeholder="Emoji" value={catForm.emoji} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white" disabled={loading}>{catForm.id ? 'Atualizar' : 'Criar'}</button>
              <button type="button" onClick={resetCatForm} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">Limpar</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {categories.map(c => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{c.emoji}</div>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{c.slug}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editCategory(c)} className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">Editar</button>
                <button onClick={() => removeCategory(c.id)} className="px-3 py-1 rounded bg-red-600 text-white">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Gerenciar Produtos</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Cadastre e edite produtos com categoria, imagem, preço e tags.</p>
          </div>
          <button type="button" onClick={() => setShowProductForm(prev => !prev)} className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
            {showProductForm ? 'Ocultar cadastro' : 'Cadastrar produto'}
          </button>
        </div>

        {showProductForm && (
          <form onSubmit={submit} className="space-y-3 p-4 rounded border border-slate-200 bg-slate-50 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <input placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" required />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
              </select>
            </div>

            <textarea placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" rows={4} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <input type="number" step="0.01" placeholder="Preço" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value || 0) }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input placeholder="Imagem (URL)" value={form.img} onChange={e => setForm(f => ({ ...f, img: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <label className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 flex flex-col gap-2 cursor-pointer">
                Upload imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setLoading(true); setError(null);
                    try {
                      const url = await uploadFile(file);
                      setForm(prev => ({ ...prev, img: url, has_img: true }));
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <input placeholder="Tag" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input placeholder="Tag color (tailwind)" value={form.tag_color} onChange={e => setForm(f => ({ ...f, tag_color: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input placeholder="Emoji" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <input type="checkbox" checked={!!form.has_img} onChange={e => setForm(f => ({ ...f, has_img: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:accent-slate-100" />
                Possui imagem
              </label>
              <input placeholder="Gradient class" value={form.gradient} onChange={e => setForm(f => ({ ...f, gradient: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{form.id ? 'Atualizar' : 'Criar'}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">Limpar</button>
            </div>
            {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
          </form>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Produtos</h2>
        {loading ? <div className="text-slate-700 dark:text-slate-200">Carregando...</div> : (
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-slate-100 flex items-center justify-center rounded overflow-hidden dark:bg-slate-800">
                    {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <span>{p.emoji}</span>}
                  </div>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{p.category} — R$ {Number(p.price || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(p)} className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">Editar</button>
                  <button onClick={() => remove(p.id)} className="px-3 py-1 rounded bg-red-600 text-white">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
