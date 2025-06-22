"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cloudinary_1 = require("cloudinary");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connectDb_1 = require("./config/connectDb");
const errorHandlingMiddileware_1 = require("./middlewares/errorHandlingMiddileware");
const authRoute_1 = require("./routes/authRoute");
const morgan_1 = __importDefault(require("morgan"));
const otpRoute_1 = require("./routes/otpRoute");
const adminRoute_1 = require("./routes/adminRoute");
const courseRoute_1 = require("./routes/courseRoute");
const tutorRoute_1 = require("./routes/tutorRoute");
const lessonRoute_1 = __importDefault(require("./routes/lessonRoute"));
const studentRoute_1 = require("./routes/studentRoute");
const quizRoute_1 = require("./routes/quizRoute");
const purchaseRoute_1 = require("./routes/purchaseRoute");
const wishlistRoute_1 = require("./routes/wishlistRoute");
const paymentRoute_1 = require("./routes/paymentRoute");
const http_1 = require("http");
const socketIO_1 = require("./config/socketIO");
const walletRoute_1 = require("./routes/walletRoute");
const progressRoute_1 = require("./routes/progressRoute");
const transactionRoute_1 = require("./routes/transactionRoute");
const reviewRoute_1 = require("./routes/reviewRoute");
const videoCallRoute_1 = __importDefault(require("./routes/videoCallRoute"));
(0, connectDb_1.connectDB)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
};
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
app.use((0, cors_1.default)(corsOptions));
(0, socketIO_1.initializeSocket)(httpServer);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
try {
    app.use("/auth", new authRoute_1.authRoutes().router);
    app.use("/otp", new otpRoute_1.OtpRoutes().router);
    app.use("/admin", new adminRoute_1.AdminRoutes().router);
    app.use("/courses", new courseRoute_1.CourseRoutes().router);
    app.use("/tutor", new tutorRoute_1.TutorRoutes().router);
    app.use("/student", new studentRoute_1.StudentRoutes().router);
    app.use("/tutor", lessonRoute_1.default);
    app.use("/quiz", new quizRoute_1.QuizRoutes().router);
    app.use("/payment", new paymentRoute_1.PaymentRoutes().router);
    app.use("/wishlist", new wishlistRoute_1.WishlistRoutes().router);
    app.use("/purchase", new purchaseRoute_1.PurchaseRoute().router);
    app.use("/wallet", new walletRoute_1.WalletRoutes().router);
    app.use("/progress", new progressRoute_1.ProgressRoutes().router);
    app.use("/transaction", new transactionRoute_1.TransactionRoutes().router);
    app.use("/reviews", new reviewRoute_1.ReviewRoutes().router);
    app.use("/api", videoCallRoute_1.default);
}
catch (error) {
    console.error("Error initializing routes:", error);
    process.exit(1);
}
app.use((error, req, res, next) => {
    console.error(`Error in ${req.method} ${req.url}:`, error);
    (0, errorHandlingMiddileware_1.handleError)(error, req, res, next);
});
