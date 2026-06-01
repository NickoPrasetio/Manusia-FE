import { IJobRepository, GetNearbyJobsInput, NearbyJobsPage } from '../IJobRepository';

export class GetNearbyJobsUseCase {
  constructor(private repo: IJobRepository) {}

  async execute(input: GetNearbyJobsInput, token: string): Promise<NearbyJobsPage> {
    return this.repo.getNearby(input, token);
  }
}
