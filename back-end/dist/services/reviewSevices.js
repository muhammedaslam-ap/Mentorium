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
exports.ReviewService = void 0;
class ReviewService {
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    addReview(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IN CONTROLLER REVIEW ADDING fromservices", reviewData);
            yield this.reviewRepository.createReview(reviewData);
        });
    }
    getReviewsForCourse(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield this.reviewRepository.getReviewsByCourseId(courseId);
            console.log("service", review);
            return review;
        });
    }
}
exports.ReviewService = ReviewService;
