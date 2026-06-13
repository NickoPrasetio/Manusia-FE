import AuthGuard from '@/components/providers/AuthGuard';
import ApplicantDetailContent from '@/components/features/dashboard/ApplicantDetailContent';

interface Props {
  params: Promise<{ jobId: string; bookingId: string }>;
}

export default async function ApplicantDetailPage({ params }: Props) {
  const { jobId, bookingId } = await params;
  return (
    <AuthGuard>
      <ApplicantDetailContent jobId={jobId} bookingId={bookingId} />
    </AuthGuard>
  );
}
