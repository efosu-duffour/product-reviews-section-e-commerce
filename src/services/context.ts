import { createContext } from "@lit/context";
import { ProductImage } from "./product-images.service";
import { InventoryService } from "./inventory.service";
import { ProductsService } from "./products.service";
import { ReviewsService } from "./reviews.service";
import { ProductInfoService } from "./product-info.service";
import { UserService } from "./users.service";

export const productImageServiceContext = createContext<ProductImage>(
  Symbol("productImageService")
);
export const inventoriesServiceContext = createContext<InventoryService>(
  Symbol("inventoriesService")
);
export const productServiceContext = createContext<ProductsService>(
  Symbol("productService")
);
export const PaginationNumberContext = createContext<number>(
  Symbol("paginationNumber")
);
export const ReviewsServiceContext = createContext<ReviewsService>(
  Symbol("reviewService")
);
export const ProductInfoServiceContext = createContext<ProductInfoService>(
  Symbol("productInfoService")
);
export const UserServiceContext = createContext<UserService>(
  Symbol("userService")
);
