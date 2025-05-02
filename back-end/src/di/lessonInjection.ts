import { LessonController } from "../controller/lessonController";
import { LessonRepository } from "../repositories/lessonRepository";
import { LessonService } from "../services/lessonServices";

const lessonRepository = new LessonRepository();
const lessonService = new LessonService(lessonRepository);

export const lessonController = new LessonController(lessonService);