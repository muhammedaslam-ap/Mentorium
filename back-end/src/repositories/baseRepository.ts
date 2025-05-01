// src/repositories/baseRepository.ts
import { Model, Document, Types } from "mongoose";

export class BaseRepository<TDoc extends Document, TCreate = Partial<Omit<TDoc, keyof Document>>> {
  constructor(protected model: Model<TDoc>) {}

  async create(data: TCreate): Promise<TDoc> {
    const createdItem = await this.model.create(data);
    return createdItem;
  }

  async findById(id: string): Promise<TDoc | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).exec();
  }

  async findOne(query: object): Promise<TDoc | null> {
    return this.model.findOne(query).exec();
  }

  async update(id: string, updateData: Partial<TDoc>): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
