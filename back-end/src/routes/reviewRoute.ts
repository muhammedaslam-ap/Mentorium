import { Request, Response, Router } from "express";
import { userAuthMiddleware, authorizeRole, CustomRequest } from "../middlewares/userAuthMiddleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked";
import { injectedReviewController } from "../di/reviewInjection";

export class ReviewRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/:courseId/add",
      userAuthMiddleware,
      authorizeRole(["student"]),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        injectedReviewController.addReview(req as CustomRequest, res)
    });

    this.router.get(
      "/:courseId",
      userAuthMiddleware,
      authorizeRole(["student", "tutor"]),
      checkUserBlocked,
      (req: Request, res: Response) =>{
     injectedReviewController.getReviewsByCourse(req as CustomRequest, res)
    });
  }
}

export default new ReviewRoutes().router;
