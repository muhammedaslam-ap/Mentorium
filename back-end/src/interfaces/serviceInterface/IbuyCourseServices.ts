import { TCourseAdd } from "../../types/course";
import { purchaseInput } from "../../types/purchase";
import { PurchaseHistoryItem } from "../../types/transation";

export interface IPurchaseService{
    saveOrder(userId: string, data: purchaseInput): Promise<void> 
    checkEnrollment(userId: string, courseId: string): Promise<boolean>
    getUserEnrolledCourses(userId: string): Promise<{ courses: TCourseAdd[]; total: number }>
    getPurchaseHistory(userId: string): Promise<PurchaseHistoryItem[]>
}