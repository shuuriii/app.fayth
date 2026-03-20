'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface HeaderProps {
  providerName: string;
}

export function Header({ providerName }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{providerName}</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
