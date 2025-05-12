import { quizRepository } from "../repositories/quizRepository";
import { quizService } from "../services/quizServices";
import { QuizController } from "../controller/quizController";

const QuizRepository = new quizRepository();
const QuizService = new quizService(QuizRepository);
const quizController = new QuizController(QuizService);
export const injectedQuizController = quizController;
