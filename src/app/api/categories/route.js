import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');

  if (!storeId) {
    return new Response(JSON.stringify({ error: 'store_id é obrigatório' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const query = supabase.from('categories').select('*').eq('store_id', storeId);

  const { data, error } = await query.order('id', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
}
