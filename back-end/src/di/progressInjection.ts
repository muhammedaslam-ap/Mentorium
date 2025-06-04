import { ProgressRepository } from "../repositories/progressRepository";
import { ProgressService } from "../services/progressServices";
import { ProgressController } from "../controller/progressController";

const progressRepository = new ProgressRepository();
const progressService = new ProgressService(progressRepository);
const progressController = new ProgressController(progressService);
export const injectedProgressController = progressController;
