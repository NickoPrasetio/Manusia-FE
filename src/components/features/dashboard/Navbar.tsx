'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Brand + greeting */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Selamat datang,</p>
            <p className="text-base font-bold text-gray-900 leading-tight">{user?.name ?? 'Pengguna'} 👋</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/profile')}
            className="relative p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"
          >
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={16} className="text-blue-500" />
                </div>
              )
            }
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors text-gray-600"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
