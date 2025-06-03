import {provide } from "@lit/context";
import {
  ProductImagesService,
} from "../../../services/product-images.service";
import { InventoryService } from "../../../services/inventory.service";
import { ProductID, ProductsService } from "../../../services/products.service";
import { customElement, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { CreatedAt } from "../../../services/collections.service";
import { inventoriesServiceContext, PaginationNumberContext, productImageServiceContext, productServiceContext } from "../../../services/context";


@customElement("sn-latest-arrival")
export class SNLatestArrival extends LitElement {
  static styles = [
    css`
    section {
      display: grid;
      row-gap: 20px;
    }

    .heading {
      display: flex;
      align-items: center;
      column-gap: 20px;
      justify-content: space-between;
    }

    a {
      text-decoration: none;
      color: black;
      font-weight: 500;
      padding: 0.4em 0.6em;
      box-shadow: 0px 2px 4px #9e9e9e89;

      border-radius: 0.2rem;
      will-change: box-shadow, background-color;

      &:hover {
        box-shadow: 0px 2px 3px #76767688;
        background-color: #d0d0d0;
      }

      &:active {
        box-shadow: 0px 2px 3px #76767688;
        background-color: #e6e6e6;
      }
    
      @media (prefers-reduced-motion: no-preference) {
        transition: all 200ms ease-in-out;
      }
    }
    `
  ]
  @provide({ context: productImageServiceContext })
  private _productImagesService = new ProductImagesService();

  @provide({ context: inventoriesServiceContext })
  private _inventoriesService = new InventoryService();

  @provide({ context: productServiceContext })
  private _productService = new ProductsService();

  @provide({ context: PaginationNumberContext })
  private _paginationNumber: number = 8;

  @state()
  private _productIDs?: ProductID[];

  connectedCallback(): void {
    super.connectedCallback();
    this._productService.init().then((products) => {
      const marchAndBeyond = (createdAt: CreatedAt) => {
        const date = new Date(createdAt);
        return date.getFullYear() === 2024 && date.getMonth() >= 2;
      };
      this._productIDs = ProductsService.getIDsByCreatedAt(
        products,
        marchAndBeyond
      );
    });
  }

  protected render() {
    return html`
      <section>
        <div class="heading">
          <h2>Latest Arrivals</h2>
          <a href="">View all</a>
        </div>
        <div class="product-list">
            <sn-product-list .product_ids=${this._productIDs}></sn-product-list>
        </div>
      </section>
    `;
  }
}
