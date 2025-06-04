import mongoose, { Types } from 'mongoose';


export interface PopulatedUser {
  _id: string;
  name: string;
}

export interface PopulatedReview {
  _id: string;
  course_id: string;
  user: PopulatedUser;
  rating: number;
  comment: string;
  createdAt: Date;
}


export interface ReviewInput {
  course_id: Types.ObjectId | string;       
  user_id: Types .ObjectId | string;
  rating: number;   
  comment: string;   
}


