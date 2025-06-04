import { Request, Response, Router } from "express";
import { authorizeRole, userAuthMiddleware } from "../middlewares/userAuthMiddleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked";
import { injectedProgressController } from "../di/progressInjection";

export class ProgressRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes(){


 this.router.post(
   "/:lessonId/complete",
   userAuthMiddleware,
   authorizeRole(["student"]),
   checkUserBlocked,

   (req: Request, res: Response) =>{
    console.log("hello imhereerererere")
     injectedProgressController.markLessonCompleted(req, res)
 });


 this.router.get(
   "/:courseId/completed-lessons",
   userAuthMiddleware,
   authorizeRole(["student"]),
   checkUserBlocked,

   (req: Request, res: Response) =>
     injectedProgressController.getCompletedLessons(req, res)
 );



  }
}

export default new ProgressRoutes().router;