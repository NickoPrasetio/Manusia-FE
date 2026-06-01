import { Booking } from '@/types';
import { IBookingRepository, GetOpenNearbyInput } from '../IBookingRepository';

export class GetOpenNearbyUseCase {
  constructor(private repo: IBookingRepository) {}

  async execute(input: GetOpenNearbyInput, token: string): Promise<Booking[]> {
    if (!input.lat || !input.lon) throw new Error('Lokasi diperlukan');
    return this.repo.getOpenNearby(input, token);
  }
}
