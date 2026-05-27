import { apiClient } from './client';
import { Review } from '@/types';

export interface ReviewApiResponse {
  id: string;
  workerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  photos?: string[];
  date: string;
}

function toReview(r: ReviewApiResponse): Review {
  return {
    id:       r.id,
    userId:   r.userId ?? '',
    userName: r.userName,
    rating:   r.rating,
    comment:  r.comment,
    photos:   r.photos ?? [],
    date:     r.date,
  };
}

export const reviewApi = {
  getByWorker: async (workerId: string): Promise<Review[]> => {
    const data = await apiClient.get<ReviewApiResponse[]>(`/api/reviews/worker/${workerId}`);
    return data.map(toReview);
  },

  createWithPhotos: async (
    workerId:  string,
    bookingId: string,
    userName:  string,
    rating:    number,
    comment:   string,
    photos:    File[],
    token:     string,
  ): Promise<Review> => {
    const form = new FormData();
    form.append('workerId',  workerId);
    form.append('bookingId', bookingId);
    form.append('userName',  userName);
    form.append('rating',    String(rating));
    form.append('comment',   comment);
    photos.forEach((p) => form.append('photos', p));
    const data = await apiClient.upload<ReviewApiResponse>('/api/reviews/with-photos', form, token);
    return toReview(data);
  },
};
