import { TTutorModel, TTutorProfileInput} from "../../types/tutor";
import { TStudent } from "../../types/user";

export interface ITutorRepository {
  
  createTutorProfile(tutorId: string, profileData: TTutorProfileInput): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  
}
