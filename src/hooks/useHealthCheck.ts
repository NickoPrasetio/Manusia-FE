'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type ServiceStatus = 'checking' | 'online' | 'offline';

const GATEWAY_URL   = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/health`;
const POLL_INTERVAL = 15_000; // recheck every 15s when offline
const TIMEOUT_MS    = 4_000;

export function useHealthCheck() {
  const [status, setStatus]       = useState<ServiceStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [retryCount, setRetryCount]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async () => {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(GATEWAY_URL, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (res.ok) {
        setStatus('online');
        setRetryCount(0);
        setLastChecked(new Date());
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      clearTimeout(timeout);
      setStatus('offline');
      setLastChecked(new Date());
      setRetryCount((c) => c + 1);
    }
  }, []);

  // Initial check
  useEffect(() => { check(); }, [check]);

  // Poll only when offline
  useEffect(() => {
    if (status !== 'offline') return;
    timerRef.current = setTimeout(check, POLL_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status, retryCount, check]);

  return { status, lastChecked, retryCount, retry: check };
}
