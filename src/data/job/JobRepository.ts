import { NearbyJob } from '@/types';
import { IJobRepository, GetNearbyJobsInput, NearbyJobsPage, CreateJobInput } from '@/domain/job/IJobRepository';
import { jobApi } from '@/lib/api/job.api';

export class JobRepository implements IJobRepository {
  async getById(id: string, token: string): Promise<NearbyJob> {
    return jobApi.getById(id, token);
  }

  async getNearby(input: GetNearbyJobsInput, token: string): Promise<NearbyJobsPage> {
    return jobApi.getNearby(
      input.lat,
      input.lon,
      token,
      input.radiusKm ?? 50,
      input.category,
      input.page ?? 1,
      input.limit ?? 10,
    );
  }

  async create(payload: CreateJobInput, token: string): Promise<NearbyJob> {
    return jobApi.create(payload, token);
  }

  async getMy(token: string): Promise<NearbyJob[]> {
    return jobApi.getMy(token);
  }

  async close(id: string, token: string): Promise<NearbyJob> {
    return jobApi.close(id, token);
  }
}
