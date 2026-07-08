import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');

  const query = supabaseAdmin.from('products').select('*');
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.is('store_id', null);
  }

  const { data, error } = await query.order('id', { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, name, description, price, tag, tag_color, img, images, emoji, gradient, has_img, store_id } = body;
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ category, name, description, price, tag, tag_color, img, images: images || [], emoji, gradient, has_img, store_id }])
      .select()
      .single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
