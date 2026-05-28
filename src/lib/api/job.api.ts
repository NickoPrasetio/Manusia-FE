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

/** Paginated response for GET /api/jobs/nearby */
export interface NearbyJobsResponse {
  jobs: NearbyJob[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const jobApi = {
  /**
   * Fetch open jobs near a location — paginated.
   * @param lat      Worker latitude
   * @param lon      Worker longitude
   * @param token    JWT
   * @param radiusKm Search radius in km (default 50)
   * @param category Filter by category — omit or '' for all
   * @param page     Page number 1-based (default 1)
   * @param limit    Items per page, max 50 (default 10)
   */
  getNearby: (
    lat: number,
    lon: number,
    token: string,
    radiusKm = 50,
    category?: JobCategory | '',
    page = 1,
    limit = 10,
  ): Promise<NearbyJobsResponse> => {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius: String(radiusKm),
      page: String(page),
      limit: String(limit),
    });
    if (category) params.set('category', category);
    return apiClient.get<NearbyJobsResponse>(`/api/jobs/nearby?${params}`, token);
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
