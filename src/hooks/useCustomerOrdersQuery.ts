import { useQuery } from '@tanstack/react-query';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { GetMyBookingsUseCase } from '@/domain/booking/usecases/GetMyBookingsUseCase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

const useCase = new GetMyBookingsUseCase(new BookingRepository());

export function useCustomerOrdersQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.bookings.my,
    queryFn:  () => useCase.execute(token!),
    enabled:  !!token,
  });
}
