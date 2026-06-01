import { Worker } from '@/types';
import { IWorkerRepository } from '../IWorkerRepository';

export class GetWorkerByIdUseCase {
  constructor(private repo: IWorkerRepository) {}

  async execute(id: string): Promise<Worker> {
    if (!id?.trim()) throw new Error('Worker ID tidak boleh kosong');
    return this.repo.getById(id);
  }
}
