import { useQuery } from '@tanstack/react-query';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { GetWorkerOrdersUseCase } from '@/domain/booking/usecases/GetWorkerOrdersUseCase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

const useCase = new GetWorkerOrdersUseCase(new BookingRepository());

export function useWorkerOrdersQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.bookings.workerOrders,
    queryFn:  () => useCase.execute(token!),
    enabled:  !!token,
  });
}
