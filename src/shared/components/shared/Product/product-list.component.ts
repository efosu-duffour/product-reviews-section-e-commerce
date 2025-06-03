import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  ProductID,
  ProductsService,
} from "../../../../services/products.service";
import { consume } from "@lit/context";

import {
  ProductFirstImageWithColor,
  ProductImagesService,
} from "../../../../services/product-images.service";
import { InventoryService } from "../../../../services/inventory.service";
import { ProductCardItem } from "./product-card.component";
import "../Product/product-card.component";
import { repeat } from "lit/directives/repeat.js";
import {
  inventoriesServiceContext,
  productImageServiceContext,
  productServiceContext,
  ReviewsServiceContext,
} from "../../../../services/context";
import { ReviewsService } from "../../../../services/reviews.service";

@customElement("sn-product-list")
export class SNProductList extends LitElement {
  static styles = [
    css`
      .product-list-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        row-gap: 55px;
        column-gap: 30px;
      }
    `,
  ];

  @property({ type: Array })
  product_ids?: ProductID[];

  @consume({ context: productImageServiceContext })
  private _productImageService?: ProductImagesService;

  @consume({ context: inventoriesServiceContext })
  private _inventoriesService?: InventoryService;

  @consume({ context: productServiceContext })
  private _productService?: ProductsService;

  @consume({ context: ReviewsServiceContext })
  private _reviewService?: ReviewsService;

  @property({ type: String })
  currentSort?: string = undefined;

  private _sortFilteredProductIDs(
    filteredProductIDs: ProductID[]
  ): ProductID[] {
    // Sorting according to the current sorting pattern

    if (this.currentSort) {
      switch (this.currentSort) {
        case "popular":
          // Sort according to most popular
          break;
        case "best":
          filteredProductIDs.sort(
            (a, b) =>
              this._reviewService!.getAverageRatingByID(b) -
              this._reviewService!.getAverageRatingByID(a)
          );
          break;
        case "newest":
          filteredProductIDs.sort(
            (a, b) =>
              this._productService!.getDateByID(b).valueOf() -
              this._productService!.getDateByID(a).valueOf()
          );
          break;
        case "high_price":
          filteredProductIDs.sort(
            (a, b) =>
              this._inventoriesService!.getHighestPriceByID(b) -
              this._inventoriesService!.getHighestPriceByID(a)
          );
          break;
        case "low_price":
          filteredProductIDs.sort(
            (a, b) =>
              this._inventoriesService!.getLowestPriceByID(a) -
              this._inventoriesService!.getLowestPriceByID(b)
          );
          break;
      }
    }

    return filteredProductIDs;
  }

  private _createProductItems = (
    product_ids: ProductID[]
  ): ProductCardItem[] => {
    product_ids = this._sortFilteredProductIDs(product_ids);
    const productItems: ProductCardItem[] = [];
    for (let i = 0; i < product_ids.length; i++) {
      const productItem = {} as ProductCardItem;
      const productId = product_ids[i];
      productItem.product_name = this._productService!.getNameByID(productId);
      productItem.list_price = `$${this._inventoriesService!.getListPriceByID(
        productId
      )}`;
      productItem.sale_price = `$${this._inventoriesService!.getSalePriceByID(
        productId
      )}`;
      productItem.product_id = productId;
      productItem.colors = this._inventoriesService!.getColorsByID(productId);
      productItem.images = [] as ProductFirstImageWithColor[];

      productItem.colors.forEach((color) => {
        productItem.images.push({
          color,
          image: this._productImageService!.getFirstImageByColor(
            productId,
            color
          ),
        });
      });

      productItems.push(productItem);
    }

    return productItems;
  };

  protected render() {
    const productItems = this._createProductItems(this.product_ids ?? []);
    return html`
      <div class="product-list-container">
        ${repeat(
          productItems,
          (productItem) => productItem.product_id,
          (productItem) =>
            html`<sn-product-card
              .productItem=${productItem}
              selectedColor=${productItem.colors[0]}
            ></sn-product-card>`
        )}
      </div>
    `;
  }
}
