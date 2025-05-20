import { IPurchaseService } from "../interfaces/serviceInterface/IbuyCourseServices";
import { IPurchaseRepository } from "../interfaces/repositoryInterface/IbuyCourseRepository";
import { purchaseInput } from "../types/purchase";
import { TCourseAdd } from "../types/course";

export class PurchaseService implements IPurchaseService{
    constructor(private _purchaseRepository:IPurchaseRepository){}

  async saveOrder(userId: string, data: purchaseInput): Promise<void> {
        await this._purchaseRepository.saveOrder(userId, data);
    }

    async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
        if (!userId || !courseId) {
            throw new Error("userId or courseId is undefined");
        }
        return await this._purchaseRepository.isEnrolled(userId, courseId);
    }

    async getUserEnrolledCourses(userId: string): Promise<{ courses: TCourseAdd[]; total: number }> {
    return this._purchaseRepository.getEnrolledCourses(userId);
  }

}