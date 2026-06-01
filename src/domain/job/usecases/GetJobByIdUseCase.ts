import { NearbyJob } from '@/types';
import { IJobRepository } from '../IJobRepository';

export class GetJobByIdUseCase {
  constructor(private repo: IJobRepository) {}

  async execute(id: string, token: string): Promise<NearbyJob> {
    if (!id?.trim()) throw new Error('Job ID tidak boleh kosong');
    return this.repo.getById(id, token);
  }
}
