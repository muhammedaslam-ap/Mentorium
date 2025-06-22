"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedBuyCourseController = void 0;
const buyCourseController_1 = require("../controller/buyCourseController");
const buyCourseRepository_1 = require("../repositories/buyCourseRepository");
const buyCourseService_1 = require("../services/buyCourseService");
const buyCourseRepository = new buyCourseRepository_1.PurchaseRepository();
const buyCourseService = new buyCourseService_1.PurchaseService(buyCourseRepository);
exports.injectedBuyCourseController = new buyCourseController_1.PurchaseController(buyCourseService);
