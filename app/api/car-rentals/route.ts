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
      .from('car_rentals')
      .select('*, cars(name, cover_image, brand, model)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function orNull(v: unknown) { return (v === '' || v === undefined) ? null : v; }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { renter_name, renter_phone, start_date, end_date } = body;
    if (!renter_name || !renter_phone || !start_date || !end_date)
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });

    // Build clean row — strip generated 'days', coerce empty strings to null
    const row = {
      car_id:          orNull(body.car_id),
      car_name:        orNull(body.car_name),
      renter_name:     String(renter_name).trim(),
      renter_email:    orNull(body.renter_email),
      renter_phone:    String(renter_phone).trim(),
      start_date,
      end_date,
      pickup_time:     orNull(body.pickup_time),
      pickup_location: orNull(body.pickup_location),
      service_type:    body.service_type || 'rent',
      is_welcome_ride: Boolean(body.is_welcome_ride),
      total_price:     body.total_price ? Math.round(Number(body.total_price)) : null,
      notes:           orNull(body.notes),
      status:          'pending',
    };

    const { data, error } = await getAdmin().from('car_rentals').insert([row]).select().single();
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
      .from('car_rentals').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
