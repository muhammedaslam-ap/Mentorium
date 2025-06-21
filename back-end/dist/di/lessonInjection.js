"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonController = void 0;
const lessonController_1 = require("../controller/lessonController");
const lessonRepository_1 = require("../repositories/lessonRepository");
const lessonServices_1 = require("../services/lessonServices");
const lessonRepository = new lessonRepository_1.LessonRepository();
const lessonService = new lessonServices_1.LessonService(lessonRepository);
exports.lessonController = new lessonController_1.LessonController(lessonService);
