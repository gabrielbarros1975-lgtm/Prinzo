import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const userId = searchParams.get('user_id');
  const email = searchParams.get('email');

  if (slug) {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Loja não encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (userId) {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Lojista não encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (email) {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_email', email)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Lojista não encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Parâmetro inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, name, description, whatsapp_number, owner_email, owner_password, auth_user_id } = body;

    if (!slug || !name || !whatsapp_number || !owner_email) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabase
      .from('stores')
      .insert([
        {
          slug: slug.toLowerCase().trim(),
          name,
          description,
          whatsapp_number,
          owner_email,
          owner_password: owner_password || null,
          auth_user_id: auth_user_id || null,
          subscription_active: false, // Inicia inativo até ativar/pagar
        }
      ])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, whatsapp_number, pix_key, pix_name, pix_city, mp_access_token, payment_methods, subscription_active } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID da loja não informado' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (whatsapp_number !== undefined) updateData.whatsapp_number = whatsapp_number;
    if (pix_key !== undefined) updateData.pix_key = pix_key;
    if (pix_name !== undefined) updateData.pix_name = pix_name;
    if (pix_city !== undefined) updateData.pix_city = pix_city;
    if (mp_access_token !== undefined) updateData.mp_access_token = mp_access_token;
    if (payment_methods !== undefined) updateData.payment_methods = payment_methods;
    if (subscription_active !== undefined) updateData.subscription_active = subscription_active;

    const { data, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
