import { IWishlistRepository } from "../interfaces/repositoryInterface/IwishlistRepository";
import { IWishlistService } from "../interfaces/serviceInterface/IwishlistServices";
import { TCourseAdd } from "../types/course";

export class WishlistService implements IWishlistService{
    constructor(private _wishlistRepository:IWishlistRepository){}

    async addToWishlist(userId: string, courseId: string): Promise<boolean> {
      return  await this._wishlistRepository.addToWishlist(userId,courseId)
    }

    async getWishlisted(userId: string, page: number, limit: number): Promise<TCourseAdd[] | []> {
        console.log('get the ----',userId)
        return await this._wishlistRepository.getWishlisted(userId,page,limit)
    }

    async removeWishlist(userId: string, courseId: string): Promise<void> {
        await this._wishlistRepository.removeWishlist(userId,courseId)
    }
}