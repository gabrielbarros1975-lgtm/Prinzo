export async function fetchProducts(category = 'todos', storeId = '') {
  const search = new URLSearchParams();
  if (category && category !== 'todos') search.set('category', category);
  if (storeId) search.set('store_id', storeId);

  const res = await fetch(`/api/products?${search.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error('Falha ao buscar produtos');
  }

  return res.json();
}
