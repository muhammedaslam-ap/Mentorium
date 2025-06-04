import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import {verificationUploadMiddleware} from '../middlewares/S3.uploader';
import { injectedTutorController } from '../di/tutorInjection';

export class TutorRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/profile',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      verificationUploadMiddleware,
      (req: Request, res: Response) =>
        injectedTutorController.addTutorProfile(req as CustomRequest, res)
    );

    this.router.get(
      '/profile',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedTutorController.getTutorProfile(req as CustomRequest, res)
    );

    this.router.get(
      "/notifications",
      userAuthMiddleware,
      authorizeRole(["tutor", "student"]), 
      checkUserBlocked,
      (req: Request, res: Response) => {
        console.log("Fetching notifications 3");
        injectedTutorController.getNotification(req as CustomRequest, res);
      }
    );

    this.router.put(
      "/notifications/read-all",
      userAuthMiddleware,
      authorizeRole(["tutor", "student"]), 
      checkUserBlocked,
      (req: Request, res: Response) =>{
                console.log("notificaiton 1")
        injectedTutorController.markAllNotificationsAsRead(req as CustomRequest, res)
    });

    this.router.put(
      "/notifications/:id/read",
      userAuthMiddleware,
      authorizeRole(["tutor", "student"]),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        console.log("notificaiton 2")
        injectedTutorController.markNotificationAsRead(req as CustomRequest, res)
   } );
  
   
    this.router.put(
      '/editProfile',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      verificationUploadMiddleware, 
      (req: Request, res: Response) =>
        injectedTutorController.updateTutorProfile(req as CustomRequest, res)
    );

     this.router.get(
       "/students",
       userAuthMiddleware,
       authorizeRole(["tutor","student"]),
       checkUserBlocked,

       (req: Request, res: Response) =>
         injectedTutorController.getEnrolledStudent(req as CustomRequest, res)
     );


      this.router.get(
       "/tutor/:tutorId",
       userAuthMiddleware,
       authorizeRole(["tutor","student"]),
       checkUserBlocked,

       (req: Request, res: Response) =>
         injectedTutorController.tutorProfile( req as CustomRequest , res)
     );


    this.router.get(
      '/document',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedTutorController.getDocumentPresignedUrl(req as CustomRequest, res)
    );
  }
}

export default new TutorRoutes().router;