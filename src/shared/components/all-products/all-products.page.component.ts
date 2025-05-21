import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  ProductImagesService,
} from "../../../services/product-images.service";
import { InventoryService } from "../../../services/inventory.service";
import { ProductID, ProductsService } from "../../../services/products.service";
import { SNProductList } from "../shared/Product/product-list.component";
import "../shared/Product/product-list.component";
import { provide } from "@lit/context";
import { inventoriesServiceContext, PaginationNumberContext, productImageServiceContext, productServiceContext } from "../../../services/context";
import "../shared/Filters/product-filter.component";

@customElement("sn-all-products")
export class SNAllProducts extends LitElement {
  @provide({ context: productImageServiceContext })
  private _productImagesService = new ProductImagesService();

  @provide({ context: inventoriesServiceContext })
  private _inventoriesService = new InventoryService();

  @provide({ context: productServiceContext })
  private _productService = new ProductsService();

  @provide({ context: PaginationNumberContext })
  private _paginationNumber: number = 8;

  private _originalProductIDs: ProductID[] = [];

  @state()
  private _filteredProductIDs!: ProductID[];

  connectedCallback(): void {
    super.connectedCallback();
    Promise.all([
      this._productImagesService.init(),
      this._inventoriesService.init(),
      this._productService.init(),
    ]).then(() => {
      this._originalProductIDs = this._productService.getAllIDs();
      this._filteredProductIDs = this._originalProductIDs;
    });
  }

  static styles = [
    css`
    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    .container {
      display: grid;
      grid-template-columns: auto 1fr;
      position: relative;
      height: 100vh;
    }
    
    aside {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      
    }
    
    main {
      overflow-y: auto;
      height: 100vh;
      padding: 10px;
    }
    `
  ]

  protected render(): unknown {
    return html`
      <div class="container">
        <aside>
          <sn-product-filter></sn-product-filter>
        </aside>
        <main>
          <!-- To implement sortButton later -->
          <button>Some Button</button>
          <div>
            <sn-product-list .product_ids=${this._filteredProductIDs}></sn-product-list>
          </div>
        </main>
      </div>
    `;
  }
}
