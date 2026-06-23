import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const query = supabase.from('products').select('*');
  if (category && category !== 'todos') {
    query.eq('category', category);
  }

  const { data, error } = await query.order('id', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
}
