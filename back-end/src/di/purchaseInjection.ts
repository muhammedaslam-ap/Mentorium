
import { PurchaseController } from "../controller/buyCourseController";
import { PurchaseRepository } from "../repositories/buyCourseRepository";
import { PurchaseService } from "../services/buyCourseService";

const buyCourseRepository = new PurchaseRepository();

const buyCourseService = new PurchaseService(buyCourseRepository);

export const injectedBuyCourseController = new PurchaseController(buyCourseService)