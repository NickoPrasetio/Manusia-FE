import { NearbyJob } from '@/types';
import { IJobRepository, CreateJobInput } from '../IJobRepository';

export class CreateJobUseCase {
  constructor(private repo: IJobRepository) {}

  async execute(payload: CreateJobInput, token: string): Promise<NearbyJob> {
    if (!payload.title?.trim()) throw new Error('Judul pekerjaan wajib diisi');
    if (payload.budgetPerDay < 1) throw new Error('Budget harus lebih dari 0');
    if (payload.durationDays < 1) throw new Error('Durasi minimal 1 hari');
    return this.repo.create(payload, token);
  }
}
