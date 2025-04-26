import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDb";
import { handleError } from "./middlewares/errorHandlingMiddileware";
import { authRoutes } from "./routes/authRoute";
import { CustomError } from "./utils/custom.error";
import morgan from "morgan";
import { OtpRoutes } from "./routes/otpRoute";
import { AdminRoutes } from "./routes/adminRoute";

connectDB();
const app = express();

// ✅ CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS","PATCH","PUT","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204, 
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

try {
  app.use("/auth", new authRoutes().router);
  app.use("/otp", new OtpRoutes().router);
  app.use("/admin",new AdminRoutes().router);

} catch (error) {
  console.error("Error initializing routes:", error);
  process.exit(1); 
}

app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error in ${req.method} ${req.url}:`, error);
  handleError(error, req, res, next);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
