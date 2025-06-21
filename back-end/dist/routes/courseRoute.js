"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const courseInjection_1 = require("../di/courseInjection");
const multer_1 = require("../utils/multer");
class CourseRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/add", multer_1.upload.single("thumbnail"), userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("hiiii");
            courseInjection_1.injectedCourseController.addCourse(req, res);
        });
        this.router.get("/my-courses", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("hellooo");
            courseInjection_1.injectedCourseController.getTutorCourses(req, res);
        });
        this.router.get("/:courseId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            courseInjection_1.injectedCourseController.getCourseById(req, res);
        });
        this.router.put("/update/:courseId", multer_1.upload.single("thumbnail"), userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => courseInjection_1.injectedCourseController.updateCourse(req, res));
        this.router.delete("/delete/:courseId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => courseInjection_1.injectedCourseController.deleteCourse(req, res));
        this.router.get("/:courseId/all-students", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student", "tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            courseInjection_1.injectedCourseController.getAllStudents(req, res);
        });
    }
}
exports.CourseRoutes = CourseRoutes;
exports.default = new CourseRoutes().router;
