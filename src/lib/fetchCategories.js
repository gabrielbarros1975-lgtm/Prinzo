export async function fetchCategories(storeId = '') {
  const search = new URLSearchParams();
  if (storeId) search.set('store_id', storeId);
  const res = await fetch(`/api/categories?${search.toString()}`);
  if (!res.ok) {
    throw new Error('Falha ao buscar categorias');
  }
  return res.json();
}
