'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Users,
  Briefcase,
  Star,
  ChevronRight,
  MapPin,
  HandHelping,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import PostJobButton from './PostJobButton';
import { useWorkerAvailability } from '@/hooks/useWorkerAvailability';

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();

  const initials = (user?.name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push('/dashboard/bio')}
      onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard/bio')}
      className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-5 overflow-hidden relative shadow-lg shadow-blue-200 cursor-pointer select-none active:scale-[0.98] transition-transform"
    >
      {/* Decorative blobs */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          {/* Edit hint chip */}
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/20 text-white/90 px-2 py-0.5 rounded-full mb-2">
            <ChevronRight size={9} className="opacity-70" />
            Lihat &amp; Edit Profil
          </span>
          <h2 className="text-white text-xl font-bold leading-snug">
            Halo, {user?.name?.split(' ')[0] ?? 'Kamu'}! 👋
          </h2>
          <p className="text-white/70 text-xs mt-1.5 leading-relaxed max-w-[200px]">
            Butuh bantuan atau ingin membantu? Semuanya ada di sini.
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
        <div className="relative z-10 mt-3 flex items-center gap-1 text-white/50 text-[10px]">
          <MapPin size={10} />
          <span>Lokasi terdeteksi</span>
        </div>
      )}
    </div>
  );
}

// ── Status Toggle ─────────────────────────────────────────────────────────────

function StatusToggle() {
  const { isAvailable, toggle, isToggling } = useWorkerAvailability();

  return (
    <div className="mx-4 mt-3">
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all
          ${isAvailable
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200'
          }`}
      >
        {/* Label kiri */}
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors
            ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}
          />
          <div>
            <p className={`text-sm font-bold leading-tight transition-colors
              ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
              {isAvailable ? 'Siap Bekerja' : 'Sedang Sibuk'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isAvailable
                ? 'Kamu terlihat oleh orang yang butuh bantuan'
                : 'Kamu tidak tampil di daftar pencarian'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(!isAvailable);
          }}
          disabled={isToggling}
          className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300
            focus:outline-none disabled:opacity-60
            ${isAvailable ? 'bg-green-400' : 'bg-gray-300'}`}
          aria-label="Toggle status"
        >
          {isToggling ? (
            <Loader2
              size={14}
              className="absolute inset-0 m-auto text-white animate-spin"
            />
          ) : (
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                transition-transform duration-300
                ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}
            />
          )}
        </button>
      </div>
    </div>
  );
}

// ── "Seberapa Baik Saya" card — all users ────────────────────────────────────

function MyReviewCard() {
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
          <p className="text-white/80 text-xs mt-0.5">Lihat ulasan yang kamu terima</p>
        </div>
        <ChevronRight size={18} className="text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

// ── Action grid ───────────────────────────────────────────────────────────────

function ActionGrid({ onPostJob }: { onPostJob: () => void }) {
  const linkCards = [
    {
      href:   '/dashboard/orders',
      icon:   <ClipboardList size={20} className="text-blue-600" />,
      title:  'My Order',
      desc:   'Kelola pesananmu',
      iconBg: 'bg-blue-100',
    },
    {
      href:   '/dashboard/workers',
      icon:   <Users size={20} className="text-emerald-600" />,
      title:  'Orang Baik',
      desc:   'di Sekitar',
      iconBg: 'bg-emerald-100',
    },
    {
      href:   '/dashboard/jobs',
      icon:   <Briefcase size={20} className="text-orange-600" />,
      title:  'Pekerjaan',
      desc:   'di Sekitar',
      iconBg: 'bg-orange-100',
    },
  ];

  const cardClass =
    'group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all flex flex-col gap-3';

  return (
    <div className="px-4 mt-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Menu Utama</p>
      <div className="grid grid-cols-2 gap-3">
        {linkCards.map((card) => (
          <Link key={card.href} href={card.href} className={cardClass}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{card.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{card.desc}</p>
            </div>
          </Link>
        ))}

        {/* Minta Tolong — same card design, triggers sheet instead of navigation */}
        <button type="button" onClick={onPostJob} className={cardClass + ' text-left'}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-violet-100">
            <HandHelping size={20} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">Minta Tolong</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">Posting kebutuhanmu</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Platform stats strip ──────────────────────────────────────────────────────

function PlatformStats() {
  return (
    <div className="px-4 mt-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Platform</p>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Penolong',   value: '100+', emoji: '🙌' },
          { label: 'Kota',       value: '10+',  emoji: '📍' },
          { label: 'Avg Rating', value: '4.8',  emoji: '⭐' },
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

// ── Root export ───────────────────────────────────────────────────────────────

export default function DashboardContent() {
  const [postJobOpen, setPostJobOpen] = useState(false);

  return (
    <div className="flex flex-col pb-24">
      <Hero />
      <StatusToggle />
      <MyReviewCard />
      <ActionGrid onPostJob={() => setPostJobOpen(true)} />
      <PlatformStats />

      {/* Job form sheet — controlled by ActionGrid card */}
      <PostJobButton
        externalOpen={postJobOpen}
        onExternalClose={() => setPostJobOpen(false)}
      />
    </div>
  );
}
