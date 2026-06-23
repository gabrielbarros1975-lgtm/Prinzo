export async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) {
    throw new Error('Falha ao buscar categorias');
  }
  return res.json();
}
