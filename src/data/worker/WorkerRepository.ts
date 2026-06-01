import { Worker } from '@/types';
import { IWorkerRepository } from '@/domain/worker/IWorkerRepository';
import { workerApi, WorkerApiResponse, UpdateMyProfilePayload, WorkerPage } from '@/lib/api/worker.api';

export class WorkerRepository implements IWorkerRepository {
  async getById(id: string): Promise<Worker> {
    return workerApi.getById(id);
  }

  async getPage(page: number, size: number, search?: string, available?: boolean): Promise<WorkerPage> {
    return workerApi.getPage(page, size, search, available);
  }

  async getMyProfile(token: string): Promise<WorkerApiResponse> {
    return workerApi.getMyProfile(token);
  }

  async updateMyProfile(data: UpdateMyProfilePayload, token: string): Promise<WorkerApiResponse> {
    return workerApi.updateMyProfile(data, token);
  }

  async uploadMyPhoto(file: File, token: string): Promise<WorkerApiResponse> {
    return workerApi.uploadMyPhoto(file, token);
  }

  async updateAvailability(isAvailable: boolean, token: string, lat?: number, lon?: number): Promise<Worker> {
    return workerApi.updateAvailability(isAvailable, token, lat, lon);
  }
}
