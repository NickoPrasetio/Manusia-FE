import { Booking } from '@/types';
import { apiClient } from './client';

export interface CreateBookingPayload {
  workerId:      string;
  workerName?:   string;
  workerAvatar?: string;
  customerName:  string;
  address:       string;
  city:          string;
  latitude:      number;
  longitude:     number;
  bookingDate:   string;
  startTime:     string;
  durationDays:  number;
  paymentMethod: string;
  notes?:        string;
}

export const bookingApi = {
  create: (payload: CreateBookingPayload, token: string) =>
    apiClient.post<Booking>('/api/bookings', payload, token),

  getMy: (token: string) =>
    apiClient.get<Booking[]>('/api/bookings/my', token),

  getById: (id: string, token: string) =>
    apiClient.get<Booking>(`/api/bookings/${id}`, token),

  getWorkerOrders: (token: string) =>
    apiClient.get<Booking[]>('/api/bookings/my-orders', token),

  getServerTime: (token: string) =>
    apiClient.get<{ date: string; dateTime: string }>('/api/bookings/server-time', token),

  confirmOrder: (id: string, token: string) =>
    apiClient.patch<Booking>(`/api/bookings/${id}/confirm`, {}, token),

  completeOrder: (id: string, token: string) =>
    apiClient.patch<Booking>(`/api/bookings/${id}/complete`, {}, token),

  cancelOrder: (id: string, token: string) =>
    apiClient.patch<Booking>(`/api/bookings/${id}/cancel`, {}, token),
};
