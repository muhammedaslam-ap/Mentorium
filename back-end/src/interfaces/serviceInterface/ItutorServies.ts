import { TTutorModel, TTutorProfileInput } from "../../types/tutor";

export interface ITutorService {
  addTutorProfile(tutorId: string, profileData: TTutorProfileInput): Promise<void>;

  getTutorById(tutorId: string): Promise<TTutorModel | null>;
}
