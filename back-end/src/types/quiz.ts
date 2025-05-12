import { Types } from "mongoose";

export type Tquiz = {
  _id: Types.ObjectId;
  lesson_id: Types.ObjectId;
  question: string;
  options: string[];
  answer: string;
 
};

export type TquizInput = {
  lesson_id: Types.ObjectId;
  question: string;
  options: string[];
  answer: string;
};
