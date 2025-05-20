
import { WishlistController } from "../controller/wishlistController";
import { WishlistReposiotry } from "../repositories/wishlistRepository";
import { WishlistService } from "../services/wishlistServices";

const wishlistReposiotry = new WishlistReposiotry();

const wishlistService = new WishlistService(wishlistReposiotry);

export const injectedWishlistController = new WishlistController(wishlistService)