import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    const query = supabaseAdmin.from('categories').select('*');
    if (storeId) {
      query.eq('store_id', storeId);
    } else {
      query.is('store_id', null);
    }

    const { data, error } = await query.order('id', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { slug, name, emoji, store_id } = body;
    const { data, error } = await supabaseAdmin.from('categories').insert([{ slug, name, emoji, store_id }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
