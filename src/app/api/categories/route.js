import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
}
