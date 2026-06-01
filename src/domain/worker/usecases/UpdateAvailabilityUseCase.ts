import { Worker } from '@/types';
import { IWorkerRepository } from '../IWorkerRepository';

export class UpdateAvailabilityUseCase {
  constructor(private repo: IWorkerRepository) {}

  async execute(isAvailable: boolean, token: string, lat?: number, lon?: number): Promise<Worker> {
    return this.repo.updateAvailability(isAvailable, token, lat, lon);
  }
}
