import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const storeId = searchParams.get('store_id');

  if (!storeId) {
    return new Response(JSON.stringify({ error: 'store_id é obrigatório' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const query = supabase.from('products').select('*').eq('store_id', storeId);
  if (category && category !== 'todos') {
    query.eq('category', category);
  }

  const { data, error } = await query.order('position', { ascending: true }).order('id', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
}
