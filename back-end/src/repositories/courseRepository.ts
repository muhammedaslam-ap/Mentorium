import { ICourseRepository } from "../interfaces/repositoryInterface/IcourseRepository";
import { courseModel } from "../models/course";

import {
  FilterQuery,
  IUpdateData,
  SortOption,
  TCourseAdd,
  TCourseResponse,
} from "../types/course";
import { TCourseFilterOptions } from "../types/user";
import { tutorProfileModel } from "../models/tutorProfileModel";

export class CourseRepository implements ICourseRepository {
    async findByIdAndTutor(courseId: string, tutorId: string): Promise<TCourseResponse | null> {
        const course = await courseModel.findOne({ _id: courseId}).lean();

        
        if (!course) {
            return null;
          }
          const tutor = await tutorProfileModel.findOne({tutorId:course.tutorId})

      
          const formattedCourse: TCourseResponse = {
            _id: course!._id.toString(),          
            title: course!.title,
            tagline: course!.tagline,
            category: course!.category,
            difficulty: course!.difficulty,
            price: course!.price,
            about: course!.about,
            thumbnail: course!.thumbnail,
            tutorId: course!.tutorId.toString(),
            tutor:{
              name: tutor!.name,
              phone:tutor!.phone,
              specialization:tutor!.specialization,
              bio:tutor!.bio
            }    
          };



          return formattedCourse;
    }      

      
    async addCourse(
        data: TCourseAdd,
        thumbnail: string,
        tutorId: string
    ): Promise<void> {
      
        await courseModel.create({
        title: data.title,
        tagline: data.tagline,
        category: data.category,
        difficulty: data.difficulty,
        price: data.price,
        about: data.about,
        thumbnail: thumbnail,
        tutorId: tutorId,
        });
    }



  async getTutorCourses(
    tutorId: string,
    page: number,
    limit: number
  ): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }> {

    console.log('here is the tutor id in repo', tutorId)
    const courses = await courseModel
      .find({ tutorId })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalCourses = await courseModel.countDocuments({ tutorId });

    console.log('here is the course of tutor =>>>>>', courses, totalCourses)

    return { courses, totalCourses };
  }

  async editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void> {
    const updateData: IUpdateData = {
      title: data.title,
      tagline: data.tagline,
      category: data.category,
      difficulty: data.difficulty,
      price: data.price,
      about: data.about,
    };

    if (thumbnail.trim() !== "") {
      updateData.thumbnail = thumbnail;
    }

    await courseModel.findByIdAndUpdate(courseId, updateData);
  }

  async deleteCourse(courseId: string): Promise<void> {
    await courseModel.findByIdAndDelete({ _id: courseId });
  }

 async getAllCourses(
  options: TCourseFilterOptions
): Promise<{ courses: TCourseAdd[]; total: number }> {
  try {
    const {
      page,
      limit,
      search,
      category,
      difficulty,
      minPrice,
      maxPrice,
      sort,
    } = options;

    const skip = (page - 1) * limit;
    const filters: FilterQuery = {};

    if (search) {
      filters.$or= [
        { title: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { about: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      const categories = category.split(",").map((c) => c.trim());
      filters.category = { $in: categories };
    }

    if (difficulty) {
      const difficulties = difficulty.split(",").map((d) => d.trim());
      filters.difficulty = { $in: difficulties };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = minPrice;
      if (maxPrice !== undefined) filters.price.$lte = maxPrice;
    }

    let sortOption: SortOption = {};
    switch (sort) {
      case "popular":
        sortOption = { enrollments: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { enrollments: -1 };
    }

    const courses = await courseModel
      .find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await courseModel.countDocuments(filters);
    return { courses, total };
  } catch (error) {
    console.error("Error fetching courses:", error);
      throw new Error("Failed to fetch courses"); 

  }
}


}
