import { TNotification } from "../../types/notification";
import { TTutorModel, TTutorProfileInput, TutorProfileWithCourses } from "../../types/tutor";

export interface ITutorService {
  addTutorProfile(tutorId: string, profileData: TTutorProfileInput): Promise<void>;
  getNotifications(id: string): Promise<TNotification[] | null> 
  markAllNotificationsAsRead(id: string): Promise<void> 
  getTutorById(tutorId: string): Promise<TTutorModel | null>;
  fetchTutorDataServices(tutorId: string): Promise<TutorProfileWithCourses>
}
