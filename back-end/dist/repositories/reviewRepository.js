"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const reviewModel_1 = require("../models/reviewModel");
const mongoose_1 = require("mongoose");
class ReviewRepository {
    createReview(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('reviewData in repository:', reviewData);
            const review = new reviewModel_1.ReviewModel({
                course_id: typeof reviewData.course_id === 'string' ? new mongoose_1.Types.ObjectId(reviewData.course_id) : reviewData.course_id,
                user_id: typeof reviewData.user_id === 'string' ? new mongoose_1.Types.ObjectId(reviewData.user_id) : reviewData.user_id,
                rating: reviewData.rating,
                comment: reviewData.comment,
                createdAt: new Date(),
            });
            yield review.save();
        });
    }
    getReviewsByCourseId(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!courseId || !mongoose_1.Types.ObjectId.isValid(courseId)) {
                throw new Error('Invalid course ID');
            }
            try {
                const courseObjectId = new mongoose_1.Types.ObjectId(courseId);
                console.log(`Fetching reviews for courseId: ${courseId}`);
                const reviews = yield reviewModel_1.ReviewModel.find({ course_id: courseObjectId })
                    .sort({ createdAt: -1 })
                    .populate('user_id', 'name')
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
                                name: 'User',
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
            }
            catch (error) {
                console.error(`Error fetching reviews for courseId: ${courseId}`, error);
                throw new Error(`Failed to fetch reviews: ${error.message}`);
            }
        });
    }
}
exports.ReviewRepository = ReviewRepository;
