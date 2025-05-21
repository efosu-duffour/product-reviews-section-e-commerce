import { createContext } from "@lit/context";
import { ProductImage } from "./product-images.service";
import { InventoryService } from "./inventory.service";
import { ProductsService } from "./products.service";

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