import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { ProductImagesService } from "../../../services/product-images.service";
import { InventoryService } from "../../../services/inventory.service";
import { ProductID, ProductsService } from "../../../services/products.service";
import "../shared/Product/product-list.component";
import { provide } from "@lit/context";
import {
  inventoriesServiceContext,
  PaginationNumberContext,
  productImageServiceContext,
  productServiceContext,
  ReviewsServiceContext,
} from "../../../services/context";
import "../shared/Filters/product-filter.component";
import "./sort-by.component";
import { Task } from "@lit/task";
import { SNProductFilter } from "../shared/Filters/product-filter.component";
import { ReviewsService } from "../../../services/reviews.service";
import { SNProductCard } from "../shared/Product/product-card.component";
import { range } from "../../utils/range";

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

  @provide({ context: ReviewsServiceContext })
  private _reviewService = new ReviewsService();

  private _originalProductIDs!: ProductID[];

  @state()
  private _filteredProductIDs!: ProductID[];

  private _sortingPatterns = new Map<string, string>([
    ["popular", "most popular"],
    ["best", "best rating"],
    ["newest", "newest"],
    ["low_price", "price: low to high"],
    ["high_price", "price: high to low"],
  ]);

  @state()
  private _currentSort?: string = undefined;

  @query("aside")
  private _asideFilter!: HTMLElement;

  @query(".container")
  private _container!: HTMLDivElement;

  @query("sn-product-filter")
  private _snProductFilterComponent!: SNProductFilter;

  @query(".sn-product-list-container")
  private _snProductListContainer!: HTMLDivElement;

  private _task = new Task(this, {
    task: async () => {
      await Promise.all([
        this._productImagesService.init(),
        this._inventoriesService.init(),
        this._productService.init(),
        this._reviewService.init(),
      ]);

      this._originalProductIDs = this._productService.getAllIDs();
      this._filteredProductIDs = this._originalProductIDs;
    },
    args: () => [],
  });

  private _resetForm = (): void => {
    const resetButtonInFilterComponent = this.shadowRoot
      ?.querySelector("sn-product-filter")
      ?.shadowRoot?.querySelector('button[type="reset"]') as HTMLButtonElement;

    resetButtonInFilterComponent.click();
  };

  firstUpdated(): void {
    this._task.taskComplete.then(() => {
      const resizeObserver = new ResizeObserver(this._onResize);
      resizeObserver.observe(this);
    });
  }

  private _onResize = (): void => {
    if (this.clientWidth < 820) {
      this._snProductFilterComponent.classList.add("docked");
    } else {
      this._closeDockedFilter();
      this._snProductFilterComponent.classList.remove("docked");
    }
  };

  static styles = [
    SNProductFilter.productFilterSkeletonStyle,
    SNProductCard.productCardSkeletonStyle,
    css`
      :host {
        container-name: all-product-container;
        container-type: inline-size;
        font-size: clamp(0.8rem, 3vw, 0.9rem);
        overflow-y: hidden;
        height: 100%;
      }
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      .product-list-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        row-gap: 45px;
        column-gap: 30px;
      }

      .container {
        display: grid;
        grid-template-columns: 230px 1fr;
        column-gap: 20px;
        padding: 10px;
      }

      aside {
        position: sticky;
        top: 0;
        
        user-select: none;
        scrollbar-gutter: stable;

        &::-webkit-scrollbar {
          appearance: none;
        }

        &::backdrop {
          background-color: red;
          pointer-events: fill !important;
        }

        sn-product-filter {
          height: 100%;
        overflow-y: scroll;

        }
      }

      main {
        position: relative;
        padding-inline: 10px;
        
      }

      .nothing-found-container {
        font-size: clamp(0.8rem, 3vw, 0.9rem);
        display: grid;
        align-items: center;
        justify-content: center;
        row-gap: 15px;
        text-align: center;
        position: absolute;
        margin: auto;
        inset: 0;
        height: fit-content;
        width: fit-content;

        svg {
          width: 20px;
          color: #20299e;
        }

        .img-container {
          padding: 10px;
          aspect-ratio: 1 / 1;
          border-radius: 1000px;
          background-color: white;
          margin-inline: auto;
          display: grid;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 3px #0000002f;
        }

        .reset {
          background-color: #20299e;
          color: white;
          font-family: inherit;
          font-size: inherit;
          padding: 7px 10px;
          border-radius: 5px;
          border-style: none;
          margin-inline: auto;
          @media (prefers-reduced-motion: no-preference) {
            transition: all 200ms ease-in-out;
          }

          &:hover {
            background-color: #2934cf;
          }

          &:active {
            background-color: #2e3be7;
          }

          &:focus-visible {
            outline-offset: 4px;
          }
        }

        .title {
          font-size: clamp(1rem, 4vw, 1.05rem);
          font-weight: 600;
        }
      }

      sn-sort-by {
        display: block;
        width: fit-content;
        margin-left: auto;
      }

      .hide {
        display: none;
      }

      .show {
        display: initial;
      }

      .top-container {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      button {
        font-size: inherit;
        font-family: inherit;
        padding: 0.5em 0.7em;
        background-color: white;
        border: none;
        box-shadow: 0px 1px 3px #0000003e;
        border-radius: 0.3em;

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }

        &:hover {
          background-color: #f0f0f0;
        }

        &:active {
          background-color: #dddddd;
          outline: none;
        }

        &:focus-visible {
          outline-offset: 4px;
        }
      }

      .sn-product-list-container {
        overflow-y: scroll;
        height: 100%;
        outline: none;
        padding: 20px 10px;
      }

      @container all-product-container (max-width: 820px) {
        .container {
          grid-template-columns: 1fr;
        }
        main {
          padding: 0;
        }
        button[filter] {
          display: flex;
          align-items: center;
          column-gap: 5px;
        }
        .top-container {
          margin-bottom: 25px;
        }

        .sn-product-list-container {
          padding-block: 0;
          padding-inline: 5px;
        }

        aside {
          position: absolute;
          z-index: 3;
          top: 0;
          width: 100vw;
          left: -100%;
          padding: 0;
          visibility: hidden;
          will-change: left, backdrop-filter, background-color, visibility;

          @media (prefers-reduced-motion: no-preference) {
            transition: left 200ms ease-in-out,
              backdrop-filter 200ms 200ms ease-in-out,
              background-color 200ms 200ms ease-in-out,
              visibility 200ms allow-discrete;
          }

          sn-product-filter {
            display: block;
            padding: 30px 20px;
            width: 250px;
            height: 100%;
            background-color: white;
          }

          &.show {
            left: 0;
            visibility: visible;
            background-color: #ffffff24;
            backdrop-filter: blur(2px);
          }
        }
      }
    `,
  ];

  private _onFilterChange = (event: CustomEvent): void => {
    this._filteredProductIDs = event.detail.filteredProductIDs;
  };

  private _toggleDockedFilter(): void {
    if (this._asideFilter.classList.contains("show")) {
      this._closeDockedFilter();
    } else {
      this._showDockedFilter();
    }
  }

  private _closeDockedFilter(): void {
    this._asideFilter.classList.remove("show");
    // this._snProductListContainer.focus();
  }

  private _showDockedFilter(): void {
    this._asideFilter.classList.add("show");
    // this._asideFilter.focus();
  }

  private _onSortChange = (sortEvent: CustomEvent): void => {
    sortEvent.stopPropagation();
    this._currentSort = sortEvent.detail.sort;
  };

  private _pageSkeleton() {
    return html`<div class="container">
      <aside>${SNProductFilter.productFilterSkeleton()}</aside>
      <main>
        <div class="top-container"></div>
        <div class="product-list-container">
          ${range(this._paginationNumber + 1).map(() => {
            return SNProductCard.productCardSkeleton();
          })}
        </div>
      </main>
    </div>`;
  }
  protected render(): unknown {
    return this._task.render({
      complete: () => {
        return html`
          <div
            class="container"
            @close-docked-filter=${this._closeDockedFilter}
          >
            <aside id="filter-form">
              <sn-product-filter
                @filter-change=${this._onFilterChange}
                .globalFilteredProducts=${this._originalProductIDs}
              ></sn-product-filter>
            </aside>
            <main>
              ${this._filteredProductIDs.length === 0
                ? html`
                    <div class="nothing-found-container">
                      <div class="img-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M14.5135 5.00008L17.1201 2.39348C17.5106 2.00295 18.1438 2.00295 18.5343 2.39348L22.777 6.63612C23.1675 7.02664 23.1675 7.65981 22.777 8.05033L18.9988 11.8285V21.0001C18.9988 21.5524 18.5511 22.0001 17.9988 22.0001H5.9988C5.44652 22.0001 4.9988 21.5524 4.9988 21.0001V11.8285L1.22063 8.05033C0.830103 7.65981 0.830103 7.02664 1.22063 6.63612L5.46327 2.39348C5.85379 2.00295 6.48696 2.00295 6.87748 2.39348L9.48408 5.00008H14.5135ZM15.3419 7.00008H8.65566L6.17037 4.5148L3.34195 7.34323L6.9988 11.0001V20.0001H16.9988V11.0001L20.6557 7.34323L17.8272 4.5148L15.3419 7.00008Z"
                          ></path>
                        </svg>
                      </div>
                      <p class="title">Nothing found just yet</p>
                      <p class="sub-title">
                        Adjust your filters a bit, let's see what we can find!
                      </p>
                      <button
                        @click=${this._resetForm}
                        class="reset"
                        type="button"
                      >
                        Reset filters
                      </button>
                    </div>
                  `
                : html` <div class="top-container">
                      <button
                        @click=${this._toggleDockedFilter}
                        class="hide"
                        type="button"
                        filter
                      >
                        <svg
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M21 4V6H20L15 13.5V22H9V13.5L4 6H3V4H21ZM6.4037 6L11 12.8944V20H13V12.8944L17.5963 6H6.4037Z"
                          ></path>
                        </svg>
                        Filter
                      </button>
                      <sn-sort-by
                        @sort-change=${this._onSortChange}
                        .sorts=${this._sortingPatterns}
                      ></sn-sort-by>
                    </div>
                    <div class="sn-product-list-container">
                      <sn-product-list
                        .currentSort=${this._currentSort}
                        .product_ids=${this._filteredProductIDs}
                      ></sn-product-list>
                    </div>`}
            </main>
          </div>
        `;
      },
      pending: () => {
        return this._pageSkeleton();
      },
      initial: () => {
        return this._pageSkeleton();
      },
    });
  }
}
