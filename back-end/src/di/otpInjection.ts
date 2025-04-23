import { OtpController } from "../controller/otpController";
import { OtpRepository } from "../repositories/otpRepository";
import { UserRepository } from "../repositories/userRepository";
import { OtpService } from "../services/otp/otpServices"

const otpRepository = new OtpRepository();
const userRepository  = new UserRepository()
const otpService = new OtpService(otpRepository,userRepository);

export const injectedOtpController = new OtpController(otpService);
