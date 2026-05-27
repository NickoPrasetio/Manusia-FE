import AuthGuard from '@/components/providers/AuthGuard';
import CustomerOrderListContent from '@/components/features/dashboard/CustomerOrderListContent';

export default function OrdersPage() {
  return (
    <AuthGuard>
      <CustomerOrderListContent />
    </AuthGuard>
  );
}
