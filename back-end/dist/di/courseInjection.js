"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedCourseController = void 0;
const courseController_1 = require("../controller/courseController");
const courseRepository_1 = require("../repositories/courseRepository");
const courseServices_1 = require("../services/courseServices");
const courseRepository = new courseRepository_1.CourseRepository();
const courseService = new courseServices_1.CourseService(courseRepository);
exports.injectedCourseController = new courseController_1.CourseController(courseService);
