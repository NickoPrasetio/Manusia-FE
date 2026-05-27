import { apiClient } from './client';
import { NearbyJob, JobCategory } from '@/types';

export interface CreateJobPayload {
  customerName: string;
  title: string;
  description: string;
  budgetPerDay: number;
  todoList: string[];
  durationDays: number;
  city: string;
  latitude: number;
  longitude: number;
  category: JobCategory;
}

export const jobApi = {
  /**
   * Fetch open jobs near a location.
   * @param lat      Worker latitude
   * @param lon      Worker longitude
   * @param token    JWT
   * @param radiusKm Search radius in km (default 50)
   * @param category Filter by category — omit or '' for all
   */
  getNearby: (
    lat: number,
    lon: number,
    token: string,
    radiusKm = 50,
    category?: JobCategory | '',
  ): Promise<NearbyJob[]> => {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius: String(radiusKm),
    });
    if (category) params.set('category', category);
    return apiClient.get<NearbyJob[]>(`/api/jobs/nearby?${params}`, token);
  },

  getById: (id: string, token: string): Promise<NearbyJob> =>
    apiClient.get<NearbyJob>(`/api/jobs/${id}`, token),

  getMy: (token: string): Promise<NearbyJob[]> =>
    apiClient.get<NearbyJob[]>('/api/jobs/my', token),

  create: (payload: CreateJobPayload, token: string): Promise<NearbyJob> =>
    apiClient.post<NearbyJob>('/api/jobs', payload, token),

  close: (id: string, token: string): Promise<NearbyJob> =>
    apiClient.patch<NearbyJob>(`/api/jobs/${id}/close`, {}, token),
};
