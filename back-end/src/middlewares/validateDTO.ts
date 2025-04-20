import {NextFunction,Request,Response} from 'express'
import { AnyZodObject, ZodError } from "zod";
import { HTTP_STATUS } from "../shared/constant";
import { CustomError } from "../utils/custom.error";

export const validateDTO = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((err) => err.message).join(", ");
        throw new CustomError(errorMessage, HTTP_STATUS.BAD_REQUEST);
      }
      next(error);
    }
  };
};
