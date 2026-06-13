import { Booking } from '@/types';
import { CreateBookingPayload } from '@/lib/api/booking.api';
import { ApplyToJobInput } from './usecases/ApplyToJobUseCase';

export interface GetOpenNearbyInput {
  lat:      number;
  lon:      number;
  radiusKm?: number;
}

export interface IBookingRepository {
  create(payload: CreateBookingPayload, token: string): Promise<Booking>;
  getMy(token: string): Promise<Booking[]>;
  getById(id: string, token: string): Promise<Booking>;
  getWorkerOrders(token: string): Promise<Booking[]>;
  getOpenNearby(input: GetOpenNearbyInput, token: string): Promise<Booking[]>;
  confirm(id: string, token: string): Promise<Booking>;
  complete(id: string, token: string): Promise<Booking>;
  cancel(id: string, token: string): Promise<Booking>;
  applyToJob(input: ApplyToJobInput, token: string): Promise<Booking>;
}
