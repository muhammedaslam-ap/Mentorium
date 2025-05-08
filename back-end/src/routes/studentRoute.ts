import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { injectedStudentController } from '../di/studentInjection';

export class StudentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/profile',
      userAuthMiddleware,
      authorizeRole(['student']),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        console.log("im here")
        injectedStudentController.addStudentProfile(req as CustomRequest, res)
      }    
    );

    this.router.get(
      '/profile',
      userAuthMiddleware,
      authorizeRole(['student']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedStudentController.getStudentProfile(req as CustomRequest, res)
    );

    this.router.get(
        '/details',
        userAuthMiddleware,
        authorizeRole(['student']),
        checkUserBlocked,
        (req: Request, res: Response) =>
          injectedStudentController.studentDetails(req as CustomRequest, res)
      );
    

   
    this.router.put(
      '/editProfile',
      userAuthMiddleware,
      authorizeRole(['student']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedStudentController.updateStudentProfile(req as CustomRequest, res)
    );
  }
}

export default new StudentRoutes().router;