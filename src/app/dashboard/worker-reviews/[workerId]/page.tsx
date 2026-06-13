import AuthGuard from '@/components/providers/AuthGuard';
import WorkerReviewsContent from '@/components/features/dashboard/WorkerReviewsContent';

interface Props {
  params: Promise<{ workerId: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function WorkerReviewsPage({ params, searchParams }: Props) {
  const { workerId } = await params;
  const { name }     = await searchParams;
  return (
    <AuthGuard>
      <WorkerReviewsContent workerId={workerId} workerName={name} />
    </AuthGuard>
  );
}
