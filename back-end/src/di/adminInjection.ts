import { AdminController } from "../controller/adminController";
import { TutorRepository } from "../repositories/tutorRepository";
import { UserRepository } from "../repositories/userRepository";
import { AdminService } from "../services/adminServices";

const userRepository = new UserRepository()
const tutorRepository = new TutorRepository();
const adminService = new AdminService(userRepository,tutorRepository);



export const injectedAdminController = new AdminController(adminService);