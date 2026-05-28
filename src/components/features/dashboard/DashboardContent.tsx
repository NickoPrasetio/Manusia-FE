'use client';

import Link from 'next/link';
import {
  ClipboardList,
  Users,
  Briefcase,
  Star,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const user     = useAuthStore((s) => s.user);
  const isWorker = user?.userType === 'WORKER';

  const initials = (user?.name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-5 overflow-hidden relative shadow-lg shadow-blue-200">
      {/* Decorative blobs */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />

      <div className="flex items-center justify-between relative">
        <div className="flex-1">
          {/* Role chip */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${
            isWorker ? 'bg-green-400/20 text-green-200' : 'bg-white/20 text-white/90'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isWorker ? 'bg-green-300' : 'bg-white/70'}`} />
            {isWorker ? 'Penolong' : 'Pengguna'}
          </span>

          <h2 className="text-white text-xl font-bold leading-snug">
            Halo, {user?.name?.split(' ')[0] ?? 'Kamu'}! 👋
          </h2>
          <p className="text-white/70 text-xs mt-1.5 leading-relaxed max-w-[200px]">
            {isWorker
              ? 'Siap membantu orang-orang di sekitarmu hari ini?'
              : 'Butuh bantuan? Temukan orang yang tepat di sini.'}
          </p>
        </div>

        {/* Avatar bubble */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0 ml-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <span className="text-white text-lg font-bold">{initials}</span>
          )}
        </div>
      </div>

      {/* Location hint */}
      {(user?.latitude || user?.longitude) && (
        <div className="mt-3 flex items-center gap-1 text-white/50 text-[10px]">
          <MapPin size={10} />
          <span>Lokasi terdeteksi</span>
        </div>
      )}
    </div>
  );
}

// ── "Seberapa Baik Saya" card — WORKER only ───────────────────────────────────

function MyReviewCard() {
  const isWorker = useAuthStore((s) => s.user?.userType === 'WORKER');
  if (!isWorker) return null;

  return (
    <div className="px-4 mt-3">
      <Link
        href="/dashboard/my-reviews"
        className="group flex items-center gap-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl px-4 py-4 shadow-md shadow-amber-100 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
          <Star size={20} className="text-white fill-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Seberapa Baik Saya?</p>
          <p className="text-white/80 text-xs mt-0.5">Lihat ulasan dari pelangganmu</p>
        </div>
        <ChevronRight size={18} className="text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

// ── Action grid ───────────────────────────────────────────────────────────────

interface ActionCard {
  href:       string;
  icon:       React.ReactNode;
  title:      string;
  desc:       string;
  iconBg:     string;
  badge?:     string;
  badgeColor?: string;
  fullWidth?: boolean;
}

function ActionGrid() {
  const isCustomer = useAuthStore((s) => s.user?.userType === 'CUSTOMER');

  const cards: ActionCard[] = [
    {
      href:      '/dashboard/orders',
      icon:      <ClipboardList size={20} className="text-blue-600" />,
      title:     'My Order',
      desc:      'Kelola pesananmu',
      iconBg:    'bg-blue-100',
      badge:     'Order',
      badgeColor:'text-blue-600 bg-blue-50',
    },
    {
      href:      '/dashboard/workers',
      icon:      <Users size={20} className="text-emerald-600" />,
      title:     'Orang Baik',
      desc:      'di Sekitar',
      iconBg:    'bg-emerald-100',
      badge:     'Cari',
      badgeColor:'text-emerald-600 bg-emerald-50',
    },
    {
      href:      '/dashboard/jobs',
      icon:      <Briefcase size={20} className="text-orange-600" />,
      title:     'Pekerjaan',
      desc:      'di Sekitar',
      iconBg:    'bg-orange-100',
      badge:     'Lihat',
      badgeColor:'text-orange-600 bg-orange-50',
      fullWidth:  isCustomer,   // for customers, jobs is the last card → full width
    },
  ];

  // for CUSTOMER: My Order (half) + Orang Baik (half), Pekerjaan (full)
  // for WORKER:   My Order (half) + Orang Baik (half), Pekerjaan (half) + [future]
  return (
    <div className="px-4 mt-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Menu Utama</p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all flex flex-col gap-3 ${
              card.fullWidth ? 'col-span-2 flex-row items-center' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{card.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{card.desc}</p>
            </div>
            {card.fullWidth && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${card.badgeColor}`}>
                {card.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Worker stats strip ────────────────────────────────────────────────────────

function WorkerStats() {
  const user     = useAuthStore((s) => s.user);
  const isWorker = user?.userType === 'WORKER';
  if (!isWorker) return null;

  return (
    <div className="px-4 mt-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Platform</p>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Penolong',  value: '100+', emoji: '🙌' },
          { label: 'Kota',      value: '10+',  emoji: '📍' },
          { label: 'Avg Rating',value: '4.8',  emoji: '⭐' },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <span className="text-lg">{emoji}</span>
            <p className="text-base font-bold text-gray-900 mt-1 leading-none">{value}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tip banner ────────────────────────────────────────────────────────────────

function TipBanner() {
  const isCustomer = useAuthStore((s) => s.user?.userType === 'CUSTOMER');
  if (!isCustomer) return null;

  return (
    <div className="mx-4 mt-4">
      <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl px-4 py-3 flex items-center gap-3">
        <Sparkles size={16} className="text-violet-400 shrink-0" />
        <p className="text-xs text-violet-700 leading-relaxed">
          Tap <span className="font-bold">Minta Tolong</span> di bawah untuk memposting kebutuhanmu ke orang-orang di sekitar!
        </p>
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function DashboardContent() {
  return (
    <div className="flex flex-col pb-32">
      <Hero />
      <MyReviewCard />
      <ActionGrid />
      <WorkerStats />
      <TipBanner />
    </div>
  );
}
