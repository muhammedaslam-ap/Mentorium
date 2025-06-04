import { ReviewRepository } from "../repositories/reviewRepository";
import { ReviewService } from "../services/reviewSevices";
import { ReviewController } from "../controller/reviewController";

const reviewRepository = new ReviewRepository();
const reviewSevice = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewSevice);
export const injectedReviewController = reviewController;
