import { AdminController } from "../controller/adminController";
import { TutorRepository } from "../repositories/tutorRepository";
import { UserRepository } from "../repositories/userRepository";
import { AdminService } from "../services/adminServices";
import { TutorService } from "../services/tutorServices";

const userRepository = new UserRepository()
const tutorRepository = new TutorRepository();
const _tutorService = new TutorService(tutorRepository)
const adminService = new AdminService(userRepository,tutorRepository);



export const injectedAdminController = new AdminController(adminService,_tutorService);