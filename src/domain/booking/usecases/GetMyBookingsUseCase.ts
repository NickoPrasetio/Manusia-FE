import { Booking } from '@/types';
import { IBookingRepository } from '../IBookingRepository';

export class GetMyBookingsUseCase {
  constructor(private repo: IBookingRepository) {}

  execute(token: string): Promise<Booking[]> {
    return this.repo.getMy(token);
  }
}
