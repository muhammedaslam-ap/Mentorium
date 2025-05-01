import { TutorRepository } from "../repositories/tutorRepository";
import { TutorService } from "../services/tutorServices";
import { TutorController } from "../controller/tutorController";

const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository);
const tutorController = new TutorController(tutorService);
export const injectedTutorController = tutorController;
