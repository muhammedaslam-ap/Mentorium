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

  async update(userID: string, updateData: Partial<TDoc>): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(userID, updateData, { new: true }).exec();
    return !!result;
  }

  async delete(userID: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(userID).exec();
    return !!result;
  }
}
