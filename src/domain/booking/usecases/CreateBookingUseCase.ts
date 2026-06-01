import { Booking } from '@/types';
import { CreateBookingPayload } from '@/lib/api/booking.api';
import { IBookingRepository } from '../IBookingRepository';

export class CreateBookingUseCase {
  constructor(private repo: IBookingRepository) {}

  async execute(payload: CreateBookingPayload, token: string): Promise<Booking> {
    if (!payload.workerId)    throw new Error('Worker ID wajib diisi');
    if (!payload.bookingDate) throw new Error('Tanggal booking wajib diisi');
    if (!payload.address)     throw new Error('Alamat wajib diisi');
    return this.repo.create(payload, token);
  }
}
