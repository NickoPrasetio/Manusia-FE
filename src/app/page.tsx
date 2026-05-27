import Link from 'next/link';
import { Users, Star, Briefcase, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-dvh bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-24 pb-16 flex-1">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur">
          <Users size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Manusia</h1>
        <p className="text-blue-100 text-lg leading-relaxed max-w-xs">
          Platform freelance personal — temukan keahlian dari orang-orang terbaik di sekitarmu.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {[
            { icon: Star,      label: 'Terverifikasi'  },
            { icon: Briefcase, label: 'Semua Bidang'   },
            { icon: Users,     label: 'Komunitas'      },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-4 py-2">
              <Icon size={14} className="text-blue-100" />
              <span className="text-xs font-semibold text-white">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 flex flex-col gap-4">
        <Link
          href="/signup"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white py-4 font-bold text-base hover:bg-blue-600 transition-colors shadow-md shadow-blue-200"
        >
          Mulai Sekarang
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/login"
          className="w-full flex items-center justify-center rounded-2xl border-2 border-gray-200 text-gray-700 py-4 font-bold text-base hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          Sudah Punya Akun
        </Link>
        <p className="text-center text-xs text-gray-400 mt-2">
          Gratis · Aman · Tanpa biaya pendaftaran
        </p>
      </div>
    </main>
  );
}
