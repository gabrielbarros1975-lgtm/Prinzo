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
    const {
      slug,
      name,
      description,
      whatsapp_number,
      owner_email,
      owner_password,
      auth_user_id,
      logo_url,
      theme_font_family,
      theme_primary_color,
      theme_secondary_color,
      theme_background_color,
      theme_card_color,
      theme_text_color,
    } = body;

    if (!slug || !name || !whatsapp_number || !owner_email) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

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
          logo_url: logo_url || null,
          theme_font_family: theme_font_family || 'Manrope',
          theme_primary_color: theme_primary_color || '#0F6E56',
          theme_secondary_color: theme_secondary_color || '#132A46',
          theme_background_color: theme_background_color || '#FAF9F6',
          theme_card_color: theme_card_color || '#FFFFFF',
          theme_text_color: theme_text_color || '#132A46',
          subscription_active: false, // Inicia inativo até ativar/pagar
          trial_start_date: now.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          subscription_status: 'trial',
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
    const {
      id,
      name,
      description,
      whatsapp_number,
      pix_key,
      pix_name,
      pix_city,
      mp_access_token,
      payment_methods,
      subscription_active,
      logo_url,
      theme_font_family,
      theme_primary_color,
      theme_secondary_color,
      theme_background_color,
      theme_card_color,
      theme_text_color,
    } = body;

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
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (theme_font_family !== undefined) updateData.theme_font_family = theme_font_family;
    if (theme_primary_color !== undefined) updateData.theme_primary_color = theme_primary_color;
    if (theme_secondary_color !== undefined) updateData.theme_secondary_color = theme_secondary_color;
    if (theme_background_color !== undefined) updateData.theme_background_color = theme_background_color;
    if (theme_card_color !== undefined) updateData.theme_card_color = theme_card_color;
    if (theme_text_color !== undefined) updateData.theme_text_color = theme_text_color;

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
