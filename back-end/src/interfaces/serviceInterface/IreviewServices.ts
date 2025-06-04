import { PopulatedReview, ReviewInput } from '../../types/review';

export interface IReviewService {
  addReview(reviewData: ReviewInput): Promise<void>;
  getReviewsForCourse(courseId: string): Promise<PopulatedReview[]>;
}
