import { supabaseAdmin } from '@/lib/supabaseServer';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, name, description, price, tag, tag_color, img, images, emoji, gradient, has_img } = body;
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ category, name, description, price, tag, tag_color, img, images: images || [], emoji, gradient, has_img })
      .eq('id', id)
      .select()
      .single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id).select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
