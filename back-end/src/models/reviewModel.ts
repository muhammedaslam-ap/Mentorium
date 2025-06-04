import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  course_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ReviewModel =  mongoose.model<IReview>('Review', ReviewSchema);
