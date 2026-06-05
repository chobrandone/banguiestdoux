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

export async function GET(req: NextRequest) {
  try {
    const url    = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const admin  = process.env.SUPABASE_SERVICE_ROLE_KEY ? getAdmin() : null;
    const sb     = admin || (url && anon ? createClient(url, anon) : null);
    if (!sb) return NextResponse.json({ data: [] });

    const adminMode = req.nextUrl.searchParams.get('admin') === 'true';
    let q = sb.from('cars').select('*').order('created_at', { ascending: false });
    if (!adminMode) q = q.eq('is_published', true);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await getAdmin().from('cars').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
