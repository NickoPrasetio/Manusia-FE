import { Worker } from '@/types';
import { WorkerApiResponse, UpdateMyProfilePayload, WorkerPage } from '@/lib/api/worker.api';

export interface IWorkerRepository {
  getById(id: string): Promise<Worker>;
  getPage(page: number, size: number, search?: string, available?: boolean): Promise<WorkerPage>;
  getMyProfile(token: string): Promise<WorkerApiResponse>;
  updateMyProfile(data: UpdateMyProfilePayload, token: string): Promise<WorkerApiResponse>;
  uploadMyPhoto(file: File, token: string): Promise<WorkerApiResponse>;
  updateAvailability(isAvailable: boolean, token: string, lat?: number, lon?: number): Promise<Worker>;
}
