import { TTutorModel} from "../../types/tutor";
import { TStudent } from "../../types/user";

export interface ITutorRepository {

  updateRejectedReason(id: string, reason: string): Promise<void>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  
}
