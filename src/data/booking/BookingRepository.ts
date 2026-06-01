import { Booking } from '@/types';
import { IBookingRepository, GetOpenNearbyInput } from '@/domain/booking/IBookingRepository';
import { bookingApi, CreateBookingPayload } from '@/lib/api/booking.api';

export class BookingRepository implements IBookingRepository {
  create(payload: CreateBookingPayload, token: string): Promise<Booking> {
    return bookingApi.create(payload, token);
  }

  getMy(token: string): Promise<Booking[]> {
    return bookingApi.getMy(token);
  }

  getById(id: string, token: string): Promise<Booking> {
    return bookingApi.getById(id, token);
  }

  getWorkerOrders(token: string): Promise<Booking[]> {
    return bookingApi.getWorkerOrders(token);
  }

  getOpenNearby(input: GetOpenNearbyInput, token: string): Promise<Booking[]> {
    return bookingApi.getOpenNearby(input.lat, input.lon, token, input.radiusKm ?? 25);
  }

  confirm(id: string, token: string): Promise<Booking> {
    return bookingApi.confirmOrder(id, token);
  }

  complete(id: string, token: string): Promise<Booking> {
    return bookingApi.completeOrder(id, token);
  }

  cancel(id: string, token: string): Promise<Booking> {
    return bookingApi.cancelOrder(id, token);
  }
}
