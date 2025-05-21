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
import { Task } from "@lit/task";
import { ProductCardItem, shareableStyle } from "./product-card.component";
import { range } from "../../../utils/range";
import "../Product/product-card.component";
import { repeat } from "lit/directives/repeat.js";
import { inventoriesServiceContext, PaginationNumberContext, productImageServiceContext, productServiceContext } from "../../../../services/context";

@customElement("sn-product-list")
export class SNProductList extends LitElement {
  static styles = [
    shareableStyle,

    css`
      .product-list-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        row-gap: 35px;
        column-gap: 15px;
      }

      .name,
      .color,
      .price-container {
        height: 16px;
      }

      .name {
        height: 20px;
        width: 200px;
      }

      .color {
        width: 100px;
      }

      .price-container {
        width: 150px;
      }

      .product-card-container {
        --animation-delay: 0;

        animation-name: pulse;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-delay: var(--animation-delay);
        animation-direction: alternate;
        opacity: 0.45;

        * {
          border-radius: 5px;
          background-color: gray;
        }

        &:nth-of-type(n + 1) {
          --animation-delay: 500ms;
        }

        &:nth-of-type(n + 2) {
          --animation-delay: 700ms;
        }

        &:nth-of-type(n + 3) {
          --animation-delay: 900ms;
        }
      }

      @keyframes pulse {
        from {
          opacity: 0.4;
        }

        to {
          opacity: 0.6;
        }
      }
    `,
  ];
  @consume({ subscribe: true, context: PaginationNumberContext })
  private _paginationNumber!: number;

  @property({ type: Array })
  product_ids?: ProductID[];

  @consume({ context: productImageServiceContext })
  private _productImageService?: ProductImagesService;

  @consume({ context: inventoriesServiceContext })
  private _inventoriesService?: InventoryService;

  @consume({ context: productServiceContext })
  private _productService?: ProductsService;

  private _productCardSkeleton() {
    return html`
      <div class="product-card-container">
        <div class="gallery"></div>
        <div class="color"></div>
        <div class="name"></div>
        <div class="price-container"></div>
        <div class="colors-container">
          <div class="color-swatch"></div>
        </div>
      </div>
    `;
  }

  private _createProductItems = (
    product_ids: ProductID[]
  ): ProductCardItem[] => {
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

  private _productsTask = new Task(this, {
    task: async ([product_ids]) => {
      return this._createProductItems(product_ids!);
    },
    args: () => [this.product_ids],
  });

  protected render() {
    return html`
      <div class="product-list-container">
        ${this._productsTask.render({
          complete: (productIDs) => {
            const productItems = productIDs;
            return repeat(
              productItems,
              (productItem) => productItem.product_id,
              (productItem) =>
                html`<sn-product-card
                  .productItem=${productItem}
                  selectedColor=${productItem.colors[0]}
                ></sn-product-card>`
            );
          },
          initial: () => {
             return html`${range(this._paginationNumber).map((_) =>
            {
              return this._productCardSkeleton();
            }
            )}`
          },
          pending: () => {
             return html`${range(this._paginationNumber).map((_) =>
            {
              return this._productCardSkeleton();
            }
            )}`
          },
        })}
      </div>
    `;
  }
}
