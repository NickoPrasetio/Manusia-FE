import { Booking } from '@/types';
import { IBookingRepository } from '../IBookingRepository';

export class CompleteOrderUseCase {
  constructor(private repo: IBookingRepository) {}

  execute(id: string, token: string): Promise<Booking> {
    if (!id) throw new Error('Booking ID wajib diisi');
    return this.repo.complete(id, token);
  }
}
