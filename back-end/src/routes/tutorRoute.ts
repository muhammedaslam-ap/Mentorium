import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import uploadMiddleware from '../middlewares/S3.uploader';
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
      uploadMiddleware,
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

   
    this.router.put(
      '/editProfile',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      uploadMiddleware, 
      (req: Request, res: Response) =>
        injectedTutorController.updateTutorProfile(req as CustomRequest, res)
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