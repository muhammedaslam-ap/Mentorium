import { validateDTO } from "../middlewares/validateDTO";
import { withoutRoleRegisterSchema } from "../validation/userValidation";
import { injectedAuthController } from "../di/authInjection";
import { Request, Response, Router } from "express";

export class authRoutes{
    public router : Router
    constructor(){
        this.router = Router();
        this.initializeRoutes()
    }

    initializeRoutes(){
        this.router.post
        ('/register/user',validateDTO(withoutRoleRegisterSchema),
        (req:Request,res:Response)=>
            injectedAuthController.registerUser(req, res)
    );

    this.router.post("/login", (req: Request, res: Response) =>
        injectedAuthController.loginUser(req, res)
     );
    
}
}