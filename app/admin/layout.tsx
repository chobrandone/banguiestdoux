import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // SSR auth check — validates JWT server-side, no client-side flash
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/addmin');
  }

  // Check role from profiles table (authoritative source for roles in this app)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  if (!isAdmin) {
    redirect('/addmin');
  }

  return <AdminShell>{children}</AdminShell>;
}
