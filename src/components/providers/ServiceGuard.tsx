'use client';

import { useHealthCheck } from '@/hooks/useHealthCheck';
import { RefreshCw, ServerCrash, Wifi, WifiOff, Clock } from 'lucide-react';
import { useState } from 'react';

// ── Checking skeleton ─────────────────────────────────────────────────────────

function CheckingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
                    flex flex-col items-center justify-center gap-6 px-6">
      {/* Animated logo */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
          <Wifi size={36} className="text-blue-400 animate-pulse" />
        </div>
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-3xl border border-blue-400/30 animate-ping" />
        <div className="absolute -inset-3 rounded-[28px] border border-blue-400/10 animate-ping [animation-delay:0.3s]" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-white tracking-tight">Menghubungkan ke Server</h1>
        <p className="text-sm text-blue-300/70">Memeriksa koneksi backend...</p>
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Service Down screen ───────────────────────────────────────────────────────

function ServiceDownScreen({
  lastChecked,
  retryCount,
  onRetry,
}: {
  lastChecked: Date | null;
  retryCount: number;
  onRetry: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    setIsRetrying(true);
    await onRetry();
    setTimeout(() => setIsRetrying(false), 1500);
  }

  const lastCheckedStr = lastChecked
    ? lastChecked.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-';

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                    flex flex-col items-center justify-center px-6 gap-0">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-sm bg-slate-800/60 backdrop-blur-xl border border-slate-700/50
                      rounded-3xl px-6 py-8 flex flex-col items-center gap-5 shadow-2xl">

        {/* Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30
                          flex items-center justify-center">
            <ServerCrash size={36} className="text-red-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full
                          flex items-center justify-center border-2 border-slate-800">
            <WifiOff size={11} className="text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-white">Service Tidak Tersedia</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Backend server tidak merespons. Pastikan Docker sedang berjalan
            dan semua container aktif.
          </p>
        </div>

        {/* Status pills */}
        <div className="w-full flex flex-col gap-2">
          <StatusRow
            label="API Gateway"
            url={`${process.env.NEXT_PUBLIC_API_URL ?? 'localhost:8080'}`.replace('http://', '')}
            status="offline"
          />
          <StatusRow
            label="Auth Service"
            url="auth-service:8081"
            status="unknown"
          />
          <StatusRow
            label="Database"
            url="postgres:5432"
            status="unknown"
          />
        </div>

        {/* Last checked + retry count */}
        <div className="w-full flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>Dicek: {lastCheckedStr}</span>
          </div>
          {retryCount > 0 && (
            <span className="bg-slate-700 px-2 py-0.5 rounded-full">
              Percobaan #{retryCount}
            </span>
          )}
        </div>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800
                     text-white font-semibold rounded-2xl transition-all
                     flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Memeriksa...' : 'Coba Lagi'}
        </button>

        {/* Auto-retry notice */}
        <p className="text-[11px] text-slate-600 text-center">
          Akan dicoba otomatis setiap 15 detik
        </p>
      </div>

      {/* How to start footer */}
      <div className="relative mt-4 w-full max-w-sm bg-slate-800/40 border border-slate-700/30
                      rounded-2xl px-5 py-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Cara menjalankan backend
        </p>
        <div className="bg-slate-900/80 rounded-xl px-3 py-2.5 font-mono text-[11px] text-green-400 leading-relaxed">
          <span className="text-slate-500">$ </span>
          docker compose -f .../docker-compose.yml up -d
        </div>
      </div>
    </div>
  );
}

// ── Status row ────────────────────────────────────────────────────────────────

function StatusRow({
  label,
  url,
  status,
}: {
  label: string;
  url: string;
  status: 'online' | 'offline' | 'unknown';
}) {
  const color = {
    online:  'bg-green-500',
    offline: 'bg-red-500',
    unknown: 'bg-slate-500',
  }[status];

  const text = {
    online:  'Online',
    offline: 'Offline',
    unknown: 'Tidak diketahui',
  }[status];

  return (
    <div className="flex items-center gap-3 bg-slate-700/30 rounded-xl px-3 py-2.5">
      <div className={`w-2 h-2 rounded-full shrink-0 ${color} ${status === 'offline' ? 'animate-pulse' : ''}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-300">{label}</p>
        <p className="text-[10px] text-slate-500 font-mono truncate">{url}</p>
      </div>
      <span className={`text-[10px] font-semibold ${
        status === 'online'  ? 'text-green-400' :
        status === 'offline' ? 'text-red-400' :
        'text-slate-500'
      }`}>
        {text}
      </span>
    </div>
  );
}

// ── Main guard ────────────────────────────────────────────────────────────────

export default function ServiceGuard({ children }: { children: React.ReactNode }) {
  const { status, lastChecked, retryCount, retry } = useHealthCheck();

  if (status === 'checking') return <CheckingScreen />;

  if (status === 'offline') {
    return (
      <ServiceDownScreen
        lastChecked={lastChecked}
        retryCount={retryCount}
        onRetry={retry}
      />
    );
  }

  return <>{children}</>;
}
