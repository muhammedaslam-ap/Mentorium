import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDb";
import { handleError } from "./middlewares/errorHandlingMiddileware";
import {authRoutes} from "./routes/authRoute";

import { CustomError } from "./utils/custom.error";
import morgan from "morgan";
import { OtpRoutes } from "./routes/otpRoute";



connectDB();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173/', 
}));

app.use(express.json())
app.use("/auth", new authRoutes().router);
app.use('/',new OtpRoutes().router)


app.use((error: CustomError, req: Request, res: Response, next: NextFunction) =>
  handleError(error, req, res, next)
);


export default app;