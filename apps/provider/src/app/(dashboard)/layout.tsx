import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', user.id)
    .single();

  const providerName = profile?.full_name ?? user.email ?? 'Provider';
  const providerRole = profile?.role ?? 'provider';

  return (
    <div className="flex min-h-screen">
      <Sidebar providerName={providerName} providerRole={providerRole} />
      <div className="flex-1 flex flex-col">
        <Header providerName={providerName} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
