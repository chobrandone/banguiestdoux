import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/** POST /api/analytics  — track a page view */
export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json() as { path: string };
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    // Skip admin, api, _next paths
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const referrer   = req.headers.get('referer') || null;
    const user_agent = req.headers.get('user-agent') || null;

    await supabaseAdmin.from('page_views').insert([{ path, referrer, user_agent }]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Analytics POST error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** GET /api/analytics?range=7  — aggregate stats for admin dashboard */
export async function GET(req: NextRequest) {
  try {
    const days = Number(req.nextUrl.searchParams.get('range') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Total views in range
    const { count: totalViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since);

    // Total views last period (for delta)
    const prevSince = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000).toISOString();
    const { count: prevViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', prevSince)
      .lt('created_at', since);

    // Top pages
    const { data: rawPages } = await supabaseAdmin
      .from('page_views')
      .select('path')
      .gte('created_at', since);

    const pageCounts: Record<string, number> = {};
    (rawPages || []).forEach(r => {
      pageCounts[r.path] = (pageCounts[r.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    // Daily breakdown (last `days` days)
    const { data: rawDaily } = await supabaseAdmin
      .from('page_views')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    const dailyCounts: Record<string, number> = {};
    (rawDaily || []).forEach(r => {
      const d = r.created_at.slice(0, 10); // YYYY-MM-DD
      dailyCounts[d] = (dailyCounts[d] || 0) + 1;
    });

    // Fill in zeros for missing days
    const daily: { date: string; views: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      daily.push({ date: d, views: dailyCounts[d] || 0 });
    }

    return NextResponse.json({
      totalViews: totalViews || 0,
      prevViews:  prevViews  || 0,
      topPages,
      daily,
    });
  } catch (err) {
    console.error('Analytics GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
