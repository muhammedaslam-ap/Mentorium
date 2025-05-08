import { StudentRepository } from "../repositories/studentRepository";
import { StudentService } from "../services/studentServices";
import { StudentController } from "../controller/studentController";

const studentRepository = new StudentRepository();
const studentService = new StudentService(studentRepository);
const studentController = new StudentController(studentService);
export const injectedStudentController = studentController;
