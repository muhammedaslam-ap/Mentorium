import { IReviewService } from '../interfaces/serviceInterface/IreviewServices';
import { IReviewRepository } from '../interfaces/repositoryInterface/IreviewRepository';
import { PopulatedReview, ReviewInput } from '../types/review';

export class ReviewService implements IReviewService {
  private reviewRepository: IReviewRepository;

  constructor(reviewRepository: IReviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async addReview(reviewData: ReviewInput): Promise<void> {
    console.log("IN CONTROLLER REVIEW ADDING fromservices",reviewData)
    await this.reviewRepository.createReview(reviewData);
  }

  async getReviewsForCourse(courseId: string): Promise<PopulatedReview[]> {
    const review = await this.reviewRepository.getReviewsByCourseId(courseId);
    console.log("service",review)
    return review
  }
}
