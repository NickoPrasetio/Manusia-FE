'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Hydration-safe AuthGuard for Next.js App Router + Zustand persist.
 *
 * Problem: Zustand `persist` reads localStorage — only available on the client.
 * On the server `isAuthenticated` is always `false`. On the client, after the
 * store module loads, it may already be `true` (sync rehydration). This means
 * the first client render can produce different output than the server HTML.
 *
 * Fix: render `null` until after mount. Both server and client produce `null`
 * on the first render → hydration matches. After `useEffect` fires (client-only),
 * we re-render with the real content or redirect.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // null on first render → identical on server and client → no hydration mismatch
  if (!mounted) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
