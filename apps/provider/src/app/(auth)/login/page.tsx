'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-fayth-700">fayth.life</h1>
        <p className="text-sm text-gray-500 mt-1">Provider Dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-fayth-500 focus:border-transparent"
            placeholder="you@clinic.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-fayth-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div
            className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fayth-600 text-white font-medium py-2 px-4 rounded-lg
                     hover:bg-fayth-700 focus:outline-none focus:ring-2 focus:ring-fayth-500
                     focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
