'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { GetOpenNearbyUseCase } from '@/domain/booking/usecases/GetOpenNearbyUseCase';

const useCase = new GetOpenNearbyUseCase(new BookingRepository());

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useOpenNearbyJobs(radiusKm = 25) {
  const { token, user } = useAuthStore();
  const lat = user?.latitude;
  const lon = user?.longitude;

  return useQuery({
    queryKey:        ['open-nearby-jobs', lat, lon, radiusKm],
    queryFn:         () => useCase.execute({ lat: lat!, lon: lon!, radiusKm }, token!),
    enabled:         !!token && lat != null && lon != null,
    staleTime:       60_000,
    refetchInterval: 120_000,
  });
}
