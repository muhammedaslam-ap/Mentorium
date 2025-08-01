import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDb";
import { handleError } from "./middlewares/errorHandlingMiddileware";
import { authRoutes } from "./routes/authRoute";
import { CustomError } from "./utils/custom.error";
import morgan from "morgan";
import { OtpRoutes } from "./routes/otpRoute";
import { AdminRoutes } from "./routes/adminRoute";
import { CourseRoutes } from "./routes/courseRoute";
import { TutorRoutes } from "./routes/tutorRoute";
import LessonRoutes from "./routes/lessonRoute";
import { StudentRoutes } from "./routes/studentRoute";
import { QuizRoutes } from "./routes/quizRoute";
import { PurchaseRoute } from "./routes/purchaseRoute";
import { WishlistRoutes } from "./routes/wishlistRoute";
import { PaymentRoutes } from "./routes/paymentRoute";
import { createServer } from "http";
import { initializeSocket } from "./config/socketIO";
import { WalletRoutes } from "./routes/walletRoute";
import { ProgressRoutes } from "./routes/progressRoute";
import { TransactionRoutes } from "./routes/transactionRoute";
import { ReviewRoutes } from "./routes/reviewRoute";
import videoCallRouter from "./routes/videoCallRoute";
import { CallHistoryRoute } from "./routes/callHistoryRoute";
import { NotificationRoute } from "./routes/notificationRoute";
import { MessageRoutes } from "./routes/messageRoute";

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const corsOptions = {
  origin: [process.env.FRONTEND_URL || "http://localhost:5173"], 
  credentials: true,
  methods: ["GET", "POST", "OPTIONS", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

const app: Express = express();
const httpServer = createServer(app);

app.use(cors(corsOptions));
initializeSocket(httpServer);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

try {
  app.use("/auth", new authRoutes().router);
  app.use("/otp", new OtpRoutes().router);
  app.use("/admin", new AdminRoutes().router);
  app.use("/courses", new CourseRoutes().router);
  app.use("/tutor", new TutorRoutes().router);
  app.use("/student", new StudentRoutes().router);
  app.use("/tutor", LessonRoutes);
  app.use("/quiz", new QuizRoutes().router);
  app.use("/payment", new PaymentRoutes().router);
  app.use("/wishlist", new WishlistRoutes().router);
  app.use("/purchase", new PurchaseRoute().router);
  app.use("/wallet", new WalletRoutes().router);
  app.use("/progress", new ProgressRoutes().router);
  app.use("/transaction", new TransactionRoutes().router);
  app.use("/reviews", new ReviewRoutes().router);
  app.use('/',new CallHistoryRoute().router)
  app.use('/users',new MessageRoutes().router)
  app.use('/notification',new NotificationRoute().router)
  app.use("/api",  videoCallRouter);




} catch (error) {
  console.error("Error initializing routes:", error);
  process.exit(1);
}

app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error in ${req.method} ${req.url}:`, error);
  handleError(error, req, res, next);
});

export { app, httpServer };