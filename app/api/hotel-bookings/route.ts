import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

function getAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Validate it's a real JWT (not a placeholder URL)
  const key = svcKey && svcKey.startsWith('eyJ')
    ? svcKey
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

export async function GET() {
  try {
    const { data, error } = await getAdmin()
      .from('hotel_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Helper: empty string / undefined → null (prevents UUID / type errors in Postgres)
function orNull(v: unknown) { return (v === '' || v === undefined) ? null : v; }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guest_name, guest_phone, check_in, check_out } = body;
    if (!guest_name || !guest_phone || !check_in || !check_out)
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });

    // Build a clean insert row — strip generated 'nights', coerce empty strings to null
    const row = {
      hotel_id:    orNull(body.hotel_id),
      room_id:     orNull(body.room_id),
      hotel_name:  orNull(body.hotel_name),
      room_type:   orNull(body.room_type),
      guest_name:  String(guest_name).trim(),
      guest_email: orNull(body.guest_email),
      guest_phone: String(guest_phone).trim(),
      check_in,
      check_out,
      total_price: body.total_price ? Math.round(Number(body.total_price)) : null,
      notes:       orNull(body.notes),
      status:      'pending',
    };

    const { data, error } = await getAdmin().from('hotel_bookings').insert([row]).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    const { data, error } = await getAdmin()
      .from('hotel_bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
