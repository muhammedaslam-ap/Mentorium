import { IReviewRepository } from '../interfaces/repositoryInterface/IreviewRepository';
import { ReviewModel } from '../models/reviewModel';
import { Types } from 'mongoose';
import { PopulatedReview, ReviewInput } from '../types/review';
import mongoose from 'mongoose';

export class ReviewRepository implements IReviewRepository {
 async createReview(reviewData: ReviewInput): Promise<void> {
  console.log('reviewData in repository:', reviewData);

  const review = new ReviewModel({
    course_id: typeof reviewData.course_id === 'string' ? new Types.ObjectId(reviewData.course_id) : reviewData.course_id,
    user_id: typeof reviewData.user_id === 'string' ? new Types.ObjectId(reviewData.user_id) : reviewData.user_id,
    rating: reviewData.rating,
    comment: reviewData.comment,
    createdAt: new Date(),
  });

  await review.save();
}




async  getReviewsByCourseId(courseId: string): Promise<PopulatedReview[]> {
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    throw new Error('Invalid course ID');
  }

  try {
    const courseObjectId = new Types.ObjectId(courseId);
    console.log(`Fetching reviews for courseId: ${courseId}`);

    const reviews = await ReviewModel.find({ course_id: courseObjectId })
      .sort({ createdAt: -1 })
      .populate<{ user_id: { _id: Types.ObjectId; name: string } }>('user_id', 'name')
      .lean();

    console.log(`Found ${reviews.length} reviews for courseId: ${courseId}`);

    if (!reviews.length) {
      console.log(`No reviews found for courseId: ${courseId}`);
      return [];
    }

    return reviews.map((review) => {
      if (!review.user_id) {
        console.warn(`Review ${review._id} has no associated user`);
        return {
          _id: review._id.toString(),
          course_id: review.course_id.toString(),
          user: {
            _id: '',
            name: 'Unknown User',
          },
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        };
      }

      return {
        _id: review._id.toString(),
        course_id: review.course_id.toString(),
        user: {
          _id: review.user_id._id.toString(),
          name: review.user_id.name || 'Anonymous',
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      };
    });
  } catch (error:any) {
    console.error(`Error fetching reviews for courseId: ${courseId}`, error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }
}

}
