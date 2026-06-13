import AuthGuard from '@/components/providers/AuthGuard';
import JobApplicantsContent from '@/components/features/dashboard/JobApplicantsContent';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function JobApplicantsPage({ params }: Props) {
  const { jobId } = await params;
  return (
    <AuthGuard>
      <JobApplicantsContent jobId={jobId} />
    </AuthGuard>
  );
}
