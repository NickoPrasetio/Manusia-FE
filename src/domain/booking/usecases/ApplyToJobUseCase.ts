import { Booking } from '@/types';
import { IBookingRepository } from '../IBookingRepository';

export interface ApplyToJobInput {
  jobId:        string;
  workerName:   string;
  workerAvatar: string;
  notes?:       string;
}

export class ApplyToJobUseCase {
  constructor(private repo: IBookingRepository) {}

  async execute(input: ApplyToJobInput, token: string): Promise<Booking> {
    if (!input.jobId)   throw new Error('Job ID wajib diisi');
    if (!token)         throw new Error('Login diperlukan');
    return this.repo.applyToJob(input, token);
  }
}
