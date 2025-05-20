import { IPurchaseRepository } from "../interfaces/repositoryInterface/IbuyCourseRepository";
import { purchaseModel } from "../models/buyCourseModal";
import { TCourseAdd, TCourseResponse } from "../types/course";
import { purchaseInput } from "../types/purchase";
import {Types} from 'mongoose'

export class PurchaseRepository implements IPurchaseRepository {
  async saveOrder(userId: string, data: purchaseInput): Promise<void> {
    let purchase = await purchaseModel.findOne({ userId });

    if (purchase) {
      const purchaseExist = purchase.purchase.some(
        (item) => item.courseId.toString() === data.courseId.toString()
      );
      if (purchaseExist) {
        return;
      }

      purchase.purchase.push({
        courseId: data.courseId,
        orderId: data.orderId,
        amount: data.amount / 100,
        status: "succeeded",
      });
      await purchase.save();
      return;
    } else {
      purchase = await purchaseModel.create({
        userId,
        purchase: [
          {
            courseId: data.courseId,
            orderId: data.orderId,
            amount: data.amount / 100,
            status: "succeeded",
          },
        ],
      });
      return;
    }
  }

  async isEnrolled (userId:string,courseId:string):Promise<boolean>{
    if(!userId || !courseId){
        throw new Error("userID or CourseId are undefined")
    }

    const user =  await purchaseModel.findOne({userId})
    if(!user){
        return false
    }

    const enrolled = user.purchase.some((curr)=>curr.courseId.toString()===courseId.toString())
    console.log('finally here',enrolled)
    return enrolled
  }


 async getEnrolledCourses(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ courses: TCourseAdd[]; total: number }> {
  if (!userId) {
    throw new Error("userId is required");
  }

  const enrolledCourses = await purchaseModel
    .findOne({ userId })
    .populate<{ purchase: { courseId: TCourseAdd & { _id: Types.ObjectId } }[] }>("purchase.courseId")
    .lean();

  if (!enrolledCourses || !enrolledCourses.purchase) {
    return { courses: [], total: 0 };
  }

  const courses = enrolledCourses.purchase
    .filter((purchase) => purchase.courseId)
    .map((purchase) => purchase.courseId as TCourseAdd)
    .slice((page - 1) * limit, page * limit);

  return {
    courses,
    total: enrolledCourses.purchase.length,
  };
}
}
  
