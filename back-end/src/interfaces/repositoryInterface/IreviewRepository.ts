import { PopulatedReview, ReviewInput } from '../../types/review';

export interface IReviewRepository {
  createReview(reviewData: ReviewInput): Promise<void>;
//   getReviewById(reviewId: string): Promise<Review | null>;
  getReviewsByCourseId(courseId: string): Promise<PopulatedReview[]>;
//   updateReview(reviewId: string, reviewData: Partial<Review>): Promise<void>;
//   deleteReview(reviewId: string): Promise<void>;
}