'use client';

import { useAuthStore } from '@/store/authStore';

const STATS = [
  { label: 'Pekerja', value: '100+', icon: '👤' },
  { label: 'Kota',    value: '10+',  icon: '📍' },
  { label: 'Rating',  value: '4.8+', icon: '⭐' },
];

export default function StatsSection() {
  const userType = useAuthStore((s) => s.user?.userType);

  if (userType === 'CUSTOMER') return null;

  return (
    <div className="grid grid-cols-3 gap-3 px-4 mt-4">
      {STATS.map(({ label, value, icon }) => (
        <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
          <span className="text-xl">{icon}</span>
          <p className="text-base font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
