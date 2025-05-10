import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { injectedStudentController } from '../di/studentInjection';
import { injectedCourseController } from '../di/courseInjection';

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

    this.router.get(
      "/all-courses",
      userAuthMiddleware,
      authorizeRole(["student"]),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        console.log('hehheehhehehhehhehehe')
        injectedCourseController.getAllCourses(req as CustomRequest, res)
      }
    );


    this.router.get(
      "/courses/:courseId",
      userAuthMiddleware,
      authorizeRole(['student']),
      checkUserBlocked,
      (req: Request, res: Response) => {
        console.log(`/student/courses/${req.params.courseId} - User:`, (req as CustomRequest).user);
        injectedCourseController.getCourseById(req as CustomRequest, res);
      }
    );
  }
}

export default new StudentRoutes().router;