import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middlewares/userAuthMiddleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked";
import { injectedWishlistController } from "../di/wishlistInjection";

export class WishlistRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/:courseId",
      userAuthMiddleware,
      authorizeRole(["student"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedWishlistController.addToWishlist(req, res)
    );

    this.router.get(
      "/",
      userAuthMiddleware,
      authorizeRole(["student"]),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        console.log('heheheh')
        injectedWishlistController.getWishlisted(req, res)
    });

    this.router.delete(
      "/:courseId",
      userAuthMiddleware,
      authorizeRole(["student"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedWishlistController.removeWishlist(req, res)
    );
  }
}

export default new WishlistRoutes().router;
