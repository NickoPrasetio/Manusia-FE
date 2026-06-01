import { NearbyJob, JobCategory } from '@/types';

export interface GetNearbyJobsInput {
  lat:       number;
  lon:       number;
  radiusKm?: number;
  category?: JobCategory | '';
  page?:     number;
  limit?:    number;
}

export interface NearbyJobsPage {
  jobs:    NearbyJob[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
}

export interface CreateJobInput {
  customerName: string;
  title:        string;
  description:  string;
  budgetPerDay: number;
  durationDays: number;
  city:         string;
  category:     JobCategory;
  todoList:     string[];
  latitude:     number;
  longitude:    number;
}

export interface IJobRepository {
  getById(id: string, token: string): Promise<NearbyJob>;
  getNearby(input: GetNearbyJobsInput, token: string): Promise<NearbyJobsPage>;
  create(payload: CreateJobInput, token: string): Promise<NearbyJob>;
  getMy(token: string): Promise<NearbyJob[]>;
  close(id: string, token: string): Promise<NearbyJob>;
}
