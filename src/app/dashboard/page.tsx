import AuthGuard from '@/components/providers/AuthGuard';
import Navbar from '@/components/features/dashboard/Navbar';
import DashboardContent from '@/components/features/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-[#f0f4f8]">
        <Navbar />
        <DashboardContent />
      </main>
    </AuthGuard>
  );
}
