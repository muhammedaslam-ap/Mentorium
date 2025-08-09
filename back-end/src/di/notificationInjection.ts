import { NotificationController } from "../controller/notificationController";
import { NotificationRepository } from "../repositories/notificationRepository";
import { NotificationService } from "../services/notificationServices";

const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo);
export const notificationController = new NotificationController(notificationService);