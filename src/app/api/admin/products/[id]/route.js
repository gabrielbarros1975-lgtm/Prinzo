import { supabaseAdmin } from '@/lib/supabaseServer';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, name, description, price, tag, tag_color, img, images, emoji, gradient, has_img, position } = body;
    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (tag !== undefined) updateData.tag = tag;
    if (tag_color !== undefined) updateData.tag_color = tag_color;
    if (img !== undefined) updateData.img = img;
    if (images !== undefined) updateData.images = images || [];
    if (emoji !== undefined) updateData.emoji = emoji;
    if (gradient !== undefined) updateData.gradient = gradient;
    if (has_img !== undefined) updateData.has_img = has_img;
    if (position !== undefined) updateData.position = position;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
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
