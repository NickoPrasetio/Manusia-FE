import { WorkerApiResponse, UpdateMyProfilePayload } from '@/lib/api/worker.api';
import { IWorkerRepository } from '../IWorkerRepository';

export class UpdateMyProfileUseCase {
  constructor(private repo: IWorkerRepository) {}

  async execute(data: UpdateMyProfilePayload, token: string): Promise<WorkerApiResponse> {
    if (!token) throw new Error('Autentikasi diperlukan');
    return this.repo.updateMyProfile(data, token);
  }
}
