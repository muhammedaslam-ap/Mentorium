import  TNotification  from "../../types/notification";
import { TTutorModel, TTutorProfileInput, TutorProfileWithCourses} from "../../types/tutor";
import { TStudent } from "../../types/user";

export interface ITutorRepository {
  createTutorProfile(tutorId: string, profileData: TTutorProfileInput): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  markAllNotificationsAsRead(id: string): Promise<void> 
  getNotifications(id: string): Promise<TNotification[] | null>   
   getEnrolledStudent(
      tutorId: string
    ): Promise<{ students: TStudent[]; totalRevenue: number }>
  fetchTutorDataRepository(tutorId: string): Promise<TutorProfileWithCourses>
}
