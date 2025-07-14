import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "./product-detail.component";
import { provide } from "@lit/context";
import {
  inventoriesServiceContext,
  productImageServiceContext,
  ProductInfoServiceContext,
  productServiceContext,
  ReviewsServiceContext,
} from "../../../services/context";
import { ProductImagesService } from "../../../services/product-images.service";
import { InventoryService } from "../../../services/inventory.service";
import { ProductID, ProductsService } from "../../../services/products.service";
import { ReviewsService } from "../../../services/reviews.service";
import { Task } from "@lit/task";
import { ProductInfoService } from "../../../services/product-info.service";

@customElement("sn-product-detail-page")
export class SNProductDetailPage extends LitElement {
  @provide({ context: productImageServiceContext })
  private _productImagesService = new ProductImagesService();

  @provide({ context: inventoriesServiceContext })
  private _inventoriesService = new InventoryService();

  @provide({ context: productServiceContext })
  private _productService = new ProductsService();

  @provide({ context: ReviewsServiceContext })
  private _reviewService = new ReviewsService();

  @provide({ context: ProductInfoServiceContext })
  private _productInfoService = new ProductInfoService();

  private _selectedProductID: ProductID = "voyager-hoodie";

  private _task = new Task(this, {
    task: async () => {
      const deps = await Promise.all([
        this._productImagesService
          .init()
          .then((productImages) =>
            productImages.filter(
              (productImage) =>
                productImage.product_id === this._selectedProductID
            )
          ),
        this._inventoriesService
          .init()
          .then((inventories) =>
            InventoryService.getInventoriesByID(
              inventories,
              this._selectedProductID
            )
          ),
        this._productService
          .init()
          .then((products) =>
            products.find(
              (product) => product.product_id === this._selectedProductID
            )
          ),

        this._productInfoService
          .init()
          .then((productInfos) =>
            ProductInfoService.getProductInfo(
              productInfos,
              this._selectedProductID
            )
          ),
        this._reviewService.init().then((reviews) => {
          return {
            ratings: ReviewsService.getAverageRatingByID(
              reviews,
              this._selectedProductID
            ),
            reviews: ReviewsService.numberOfRatings(
              reviews,
              this._selectedProductID
            ),
          };
        }),
      ]);

      // Set the selected product ID from the URL;

      return deps;
    },
    args: () => [],
  });

  private _getSelectedProduct(): ProductID {
    // Extract the selected product ID from the URL;
    return "";
  }

  protected render() {
    return html`
      ${this._task.render({
        complete: ([
          productImages,
          productInventories,
          product,
          productInfos,
          ratingsInfo,
        ]) => {
          return html`
            <sn-product-detail
              .product_images=${productImages}
              .productInventories=${productInventories}
              .product=${product!}
              .product_infos=${productInfos}
              numberOfReviews=${ratingsInfo.reviews}
              ratings=${ratingsInfo.ratings}
            ></sn-product-detail>
          `;
        },
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-product-detail-page": SNProductDetailPage;
  }
}
