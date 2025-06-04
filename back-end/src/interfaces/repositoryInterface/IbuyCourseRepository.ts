import { TCourseAdd, TCourseResponse } from "../../types/course";
import { purchaseInput } from "../../types/purchase";
import { PurchaseHistoryItem } from "../../types/transation";

export interface IPurchaseRepository{
    saveOrder(userId: string, data: purchaseInput): Promise<void> 
    isEnrolled (userId:string,courseId:string):Promise<boolean>
    getEnrolledCourses(userId:string):Promise<{ courses: TCourseAdd[]; total: number }>
    getPurchaseHistory(userId: string): Promise<PurchaseHistoryItem[]>

}