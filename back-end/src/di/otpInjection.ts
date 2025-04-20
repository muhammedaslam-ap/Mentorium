import { OtpController } from "../controller/otpController";
import { OtpRepository } from "../repositories/otpRepository";
import { OtpService } from "../services/otp/otpServices"

const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);

export const injectedOtpController = new OtpController(otpService);
