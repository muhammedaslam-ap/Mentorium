import { Router, Request, Response } from "express";
import { injectedBuyCourseController } from "../di/purchaseInjection";
import { authorizeRole, userAuthMiddleware } from "../middlewares/userAuthMiddleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked";
import { CustomRequest } from "../middlewares/userAuthMiddleware";

export class PurchaseRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/saveOrder",
      userAuthMiddleware, 
      checkUserBlocked,
      authorizeRole(["student"]),
      (req: Request, res: Response) => {
        injectedBuyCourseController.saveOrder(req as CustomRequest, res);
      }
    );

    this.router.get(
      "/enrolledCourses",
      userAuthMiddleware,
      checkUserBlocked, 
      authorizeRole(["student"]),
      (req: Request, res: Response) => {
        console.log("Reached /enrolledCourses handler");
        injectedBuyCourseController.getEnrolledCourses(req as CustomRequest, res);
      }
    );

    this.router.get(
      "/Purchase-history",
      userAuthMiddleware,
      checkUserBlocked, 
      authorizeRole(["student"]),
      (req: Request, res: Response) => {
        injectedBuyCourseController.myPurchaseHistory(req as CustomRequest, res);
      }
    );

    this.router.get(
      "/enrollments/:courseId",
      userAuthMiddleware,
      (req: Request, res: Response) => {
        injectedBuyCourseController.checkEnrollment(req as CustomRequest, res);
      }
    );
  }
}

export default new PurchaseRoute().router;