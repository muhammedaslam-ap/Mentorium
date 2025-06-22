"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const studentInjection_1 = require("../di/studentInjection");
const courseInjection_1 = require("../di/courseInjection");
class StudentRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/profile', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student']), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("im here");
            studentInjection_1.injectedStudentController.addStudentProfile(req, res);
        });
        this.router.get('/profile', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student']), checkUserBlocked_1.checkUserBlocked, (req, res) => studentInjection_1.injectedStudentController.getStudentProfile(req, res));
        this.router.get('/details', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student']), checkUserBlocked_1.checkUserBlocked, (req, res) => studentInjection_1.injectedStudentController.studentDetails(req, res));
        this.router.put('/editProfile', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student']), checkUserBlocked_1.checkUserBlocked, (req, res) => studentInjection_1.injectedStudentController.updateStudentProfile(req, res));
        this.router.get("/all-courses", 
        // userAuthMiddleware,
        // authorizeRole(["student"]),
        // checkUserBlocked,
        (req, res) => {
            console.log('hehheehhehehhehhehehe');
            courseInjection_1.injectedCourseController.getAllCourses(req, res);
        });
        this.router.get("/courses/:courseId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student']), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log(`/student/courses/${req.params.courseId} - User:`, req.user);
            courseInjection_1.injectedCourseController.getCourseById(req, res);
        });
    }
}
exports.StudentRoutes = StudentRoutes;
exports.default = new StudentRoutes().router;
