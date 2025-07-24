import { Request, Response, Router } from "express";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";
import { authorizeRole } from "../middlewares/userAuthMiddleware";
import { injectedAdminController } from "../di/adminInjection";

export class AdminRoutes{
    public router = Router();
    
    constructor(){
        this.router = Router();
        this.initializeRoute();
    }

    initializeRoute(){
      this.router.get("/usersList",adminAuthMiddleware,authorizeRole(['admin']),(req: Request, res: Response) =>
        injectedAdminController.usersList(req, res)
      );
       this.router.patch(
        "/:tutorId/approve",
        adminAuthMiddleware,
        authorizeRole(["admin"]),
        (req: Request, res: Response) =>
          injectedAdminController.acceptTutor(req, res)
      );

       this.router.patch(
         "/:tutorId/reject",
         adminAuthMiddleware,
         authorizeRole(["admin"]),
         (req: Request, res: Response) =>
           injectedAdminController.rejectTutor(req, res)
       );

         this.router.patch(
           "/:id/status",
           adminAuthMiddleware,
           authorizeRole(["admin"]),
           (req: Request, res: Response) =>
             injectedAdminController.updateStatus(req, res)
         );

        // Logout
           this.router.post(
             "/logout",
             adminAuthMiddleware,
             authorizeRole(["admin"]),
             (req: Request, res: Response) =>
               injectedAdminController.logoutAdmin(req, res)
           );

           this.router.get(
            "/tutors/:tutorId/document",
            adminAuthMiddleware,
            authorizeRole(["admin"]), 
            (req: Request, res: Response) => injectedAdminController.getDocumentPresignedUrl(req, res)
          );
    }
}


export default new AdminRoutes().router;
