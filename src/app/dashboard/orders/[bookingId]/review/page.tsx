import AuthGuard from '@/components/providers/AuthGuard';
import ReviewPageContent from '@/components/features/dashboard/ReviewPageContent';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <AuthGuard>
      <ReviewPageContent bookingId={bookingId} />
    </AuthGuard>
  );
}
