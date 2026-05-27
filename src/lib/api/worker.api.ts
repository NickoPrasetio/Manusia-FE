import { apiClient } from './client';
import { Worker, WorkStatus } from '@/types';

export interface WorkerApiResponse {
  id: string;
  authId?: string;
  name: string;
  avatar: string;
  age: number;
  experience: number;
  rating: number;
  totalReviews: number;
  specializations: string[];
  location: string;
  pricePerDay: number;
  isAvailable: boolean;
  workStatus: WorkStatus;
  bio: string;
}

export interface WorkerCreatePayload {
  authId:          string;
  name:            string;
  age:             number;
  experience:      number;
  specializations: string[];
  location:        string;
  pricePerDay:     number;
  bio:             string;
}

export interface WorkerPage {
  content:       Worker[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  last:          boolean;
}

function toWorker(n: WorkerApiResponse): Worker {
  return {
    ...n,
    workStatus: n.workStatus ?? 'OPEN',
    reviews: [],
  };
}

export const workerApi = {
  getAll: async (search?: string, available?: boolean): Promise<Worker[]> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (available !== undefined) params.set('available', String(available));
    const query = params.toString() ? `?${params}` : '';
    const data = await apiClient.get<WorkerApiResponse[]>(`/api/workers${query}`);
    return data.map(toWorker);
  },

  getPage: async (page: number, size: number, search?: string, available?: boolean): Promise<WorkerPage> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));
    if (search)    params.set('search',    search);
    if (available) params.set('available', 'true');
    const raw = await apiClient.get<{
      content:       WorkerApiResponse[];
      totalElements: number;
      totalPages:    number;
      number:        number;
      last:          boolean;
    }>(`/api/workers/page?${params}`);
    return {
      content:       raw.content.map(toWorker),
      totalElements: raw.totalElements,
      totalPages:    raw.totalPages,
      number:        raw.number,
      last:          raw.last,
    };
  },

  getById: async (id: string): Promise<Worker> => {
    const data = await apiClient.get<WorkerApiResponse>(`/api/workers/${id}`);
    return toWorker(data);
  },

  create: async (payload: WorkerCreatePayload, token: string): Promise<Worker> => {
    const data = await apiClient.post<WorkerApiResponse>('/api/workers', payload, token);
    return toWorker(data);
  },

  uploadPhoto: async (workerId: string, file: File, token: string): Promise<Worker> => {
    const form = new FormData();
    form.append('file', file);
    const data = await apiClient.upload<WorkerApiResponse>(`/api/workers/${workerId}/photo`, form, token);
    return toWorker(data);
  },
};
