import { consume } from "@lit/context";
import { css, html, LitElement, nothing, PropertyValues, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  inventoriesServiceContext,
  productServiceContext,
  ReviewsServiceContext,
} from "../../../../services/context";
import {
  InventoryService,
  ProductColor,
} from "../../../../services/inventory.service";
import { repeat } from "lit/directives/repeat.js";
import {
  Category,
  Collection,
  ProductID,
  ProductsService,
} from "../../../../services/products.service";
import "../Ratings/ratings-read-only.component";
import { range } from "../../../utils/range";
import addFill from "/add-fill.svg";
import substractFill from "/subtract-fill.svg";
import { ReviewsService } from "../../../../services/reviews.service";

type indexable = {
  [a: string]: string;
};

const addFillUrl = `url("${addFill}")`;
const substractFillUrl = `url("${substractFill}")`;

@customElement("sn-product-filter")
export class SNProductFilter extends LitElement {
  static styles = [
    css`
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      :host(.docked) {
        width: 260px;
        nav {
          display: initial;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          & + hr {
            display: block;
            margin-bottom: 15px;
          }
        }
      }

      nav {
        display: none;

        & + hr {
          display: none;
        }
      }
      button {
        user-select: none;
        font-size: inherit;
        font-family: inherit;
        padding: 0.5em 0.7em;
        background-color: white;
        border: none;
        white-space: nowrap;
        cursor: pointer;

        &[type="reset"] {
          color: darkblue;
          text-decoration: underline;
          border-radius: 5px;

          &:hover {
            background-color: #aecdfc4a;
          }
        }

        &[aria-label='close'] {
          padding: 0;
        }

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
      fieldset {
        border: none;
      }

      label {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }

      .colors-container {
        display: flex;
        align-items: center;
        column-gap: 10px;
      }

      .color-swatch {
        display: block;
        width: 15px;
        aspect-ratio: 1;
        border-radius: 50%;
        outline-width: 0px;
        outline-color: transparent;
        outline-style: solid;
        border: 1px gray solid;
        will-change: outline-color, outline-offset;
        margin: 0;

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }
      }

      input:focus-visible  + .color-swatch, .color-swatch:hover {
        outline-color: #959595;
        outline-width: 3px;
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        top: auto;
        overflow: hidden;
      }

      .color {
        &:checked + .color-swatch {
          outline-color: #00b01d;
          outline-width: 3px;
        }

        &:disabled + .color-swatch {
          outline-color: transparent;
        }
      }

      .inputs {
        display: flex;
        flex-direction: column;
        row-gap: 10px;
      }

      hr {
        border-style: solid;
        border-color: #e4e4e4;
      }

      form {
        display: grid;
        row-gap: 20px;
        font-size: clamp(0.8rem, 3vw, 0.9rem);
      }

      details {
        display: grid;
        padding-left: 5px;

        &[open] {
          row-gap: 20px;

          .summary-button {
            background-image: ${unsafeCSS(substractFillUrl)};
          }
        }
      }

      .summary-button {
        width: 20px;
        aspect-ratio: 1/ 1;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        background-image: ${unsafeCSS(addFillUrl)};
      }

      details summary {
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;

        &::-webkit-details-marker {
          display: none;
        }
      }

      .ratings {

        sn-ratings-read-only {
          outline-style: solid;
          outline-width: 2px;
          outline-color: transparent;
          outline-offset: 2px;
          border-radius: 10px; 
          

          @media (prefers-reduced-motion: no-preference) {
            transition: all 200ms ease-in-out;
          }
        }
        label {
          display: flex;
          

          &:has(input:checked)::after {
            opacity: 1;
          }

          &:has(input:focus-visible) sn-ratings-read-only {
            outline-color: black;
          }

          &::after {
            content: "";
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: green;
            border-radius: 100%;

            right: 0;
            top: 0;
            bottom: 0;
            margin-block: auto;
            user-select: none;
            pointer-events: none;
            opacity: 0;
            will-change: opacity;

            @media (prefers-reduced-motion: no-preference) {
              transition: opacity 200ms ease-in-out;
            }
          }
        }
      }

      .colors-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      label {
        text-transform: capitalize;
      }

      .input-container {
        display: flex;
        align-items: center;
        column-gap: 15px;
        color: #444444;
      }
    `,
  ];
  @consume({ context: inventoriesServiceContext })
  private _inventoriesService?: InventoryService;

  @consume({ context: productServiceContext })
  private _productService?: ProductsService;

  @consume({ context: ReviewsServiceContext })
  private _reviewService?: ReviewsService;

  @property({ type: Array, attribute: false })
  globalFilteredProducts!: ProductID[];

  @property({ type: Array })
  categories!: Category[];
  collections!: Collection[];
  colors!: ProductColor[];

  private _collectionFilteredProducts!: ProductID[];
  private _ratingsFilteredProducts!: ProductID[];
  private _colorsFilteredProducts!: ProductID[];
  private _categoryFilteredProducts!: ProductID[];
  private _filteredProducts!: ProductID[];

  private _collectionFilteredProductsCache: Map<string, ProductID[]> =
    new Map();
  private _categoryFilteredProductsCache: Map<string, ProductID[]> = new Map();
  private _colorFilteredProductsCache: Map<string, ProductID[]> = new Map();
  private _ratingFilteredProductsCache: Map<string, ProductID[]> = new Map();

  @state()
  private _numberOfFiltersApplied = 0;
  private get _hasAFilterApplied(): boolean {
    return this._numberOfFiltersApplied > 0;
  }

  protected firstUpdated(): void {
    this._collectionFilteredProducts = this.globalFilteredProducts;
    this._ratingsFilteredProducts = this.globalFilteredProducts;
    this._colorsFilteredProducts = this.globalFilteredProducts;
    this._categoryFilteredProducts = this.globalFilteredProducts;
    this._filteredProducts = this.globalFilteredProducts;
  }

  private _collectionNames: indexable = {
    cozy: "Cozy Comfort",
    urban: "Urban Oasis",
    fresh: "Fresh Fusion",
  };

  private _incrementFiltersApplied(): void {
    this._numberOfFiltersApplied++;
  }

  private _decrementFiltersApplied(): void {
    const temp = this._numberOfFiltersApplied - 1;
    this._numberOfFiltersApplied = temp <= 0 ? 0 : temp;
  }

  private _onInputChanged = (event: InputEvent): void => {
    if ((event.target as HTMLInputElement).checked) {
      this._incrementFiltersApplied();
    } else {
      this._decrementFiltersApplied();
    }
  };

  private _onCategoryChanged = (event: InputEvent): void => {
    // Go through the checked input of the particular field and union their result
    // If the union is an empty set then get the original result

    const inputs = (event.currentTarget as HTMLElement).querySelectorAll(
      "input"
    );
    let filteredFieldProductIDs: Set<ProductID> = new Set();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.checked) continue;

      // Check if input filterd product is cached
      let filteredInputProductIDs: ProductID[] = [];
      if (this._categoryFilteredProductsCache.has(input.value)) {
        filteredInputProductIDs = this._categoryFilteredProductsCache.get(
          input.value
        )!;
      } else {
        filteredInputProductIDs = this._productService!.getIDsByCategory(
          input.value
        );
        this._categoryFilteredProductsCache.set(
          input.value,
          filteredInputProductIDs
        );
      }

      filteredFieldProductIDs = new Set([
        ...filteredFieldProductIDs,
        ...filteredInputProductIDs!,
      ]); // Performing Union
    }

    filteredFieldProductIDs =
      filteredFieldProductIDs.size === 0
        ? new Set(this.globalFilteredProducts)
        : filteredFieldProductIDs;

    this._categoryFilteredProducts = [...filteredFieldProductIDs];
    this._dispatchFilterEvent();
  };

  private _onCollectionChanged = (event: InputEvent): void => {
    // Go through the checked input of the particular field and union their result
    // If the union is an empty set then get the original result

    const inputs = (event.currentTarget as HTMLElement).querySelectorAll(
      "input"
    );
    let filteredFieldProductIDs: Set<ProductID> = new Set();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.checked) continue;

      // Check if input filterd product is cached
      let filteredInputProductIDs: ProductID[] = [];
      if (this._collectionFilteredProductsCache.has(input.value)) {
        filteredInputProductIDs = this._collectionFilteredProductsCache.get(
          input.value
        )!;
      } else {
        filteredInputProductIDs = this._productService!.getIDsByCollection(
          input.value
        );
        this._collectionFilteredProductsCache.set(
          input.value,
          filteredInputProductIDs
        );
      }

      filteredFieldProductIDs = new Set([
        ...filteredFieldProductIDs,
        ...filteredInputProductIDs!,
      ]); // Performing Union
    }

    filteredFieldProductIDs =
      filteredFieldProductIDs.size === 0
        ? new Set(this.globalFilteredProducts)
        : filteredFieldProductIDs;

    this._collectionFilteredProducts = [...filteredFieldProductIDs];
    this._dispatchFilterEvent();
  };

  private _onColorChanged = (event: InputEvent): void => {
    // Go through the checked input of the particular field and union their result
    // If the union is an empty set then get the original result

    const inputs = (event.currentTarget as HTMLElement).querySelectorAll(
      "input"
    );
    let filteredFieldProductIDs: Set<ProductID> = new Set();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.checked) continue;

      // Check if input filterd product is cached
      let filteredInputProductIDs: ProductID[] = [];
      if (this._colorFilteredProductsCache.has(input.value)) {
        filteredInputProductIDs = this._colorFilteredProductsCache.get(
          input.value
        )!;
      } else {
        filteredInputProductIDs = this._inventoriesService!.getIDsByColor(
          input.value
        );
        this._colorFilteredProductsCache.set(
          input.value,
          filteredInputProductIDs
        );
      }

      filteredFieldProductIDs = new Set([
        ...filteredFieldProductIDs,
        ...filteredInputProductIDs!,
      ]); // Performing Union
    }

    filteredFieldProductIDs =
      filteredFieldProductIDs.size === 0
        ? new Set(this.globalFilteredProducts)
        : filteredFieldProductIDs;

    this._colorsFilteredProducts = [...filteredFieldProductIDs];
    this._dispatchFilterEvent();
  };

  
  private _onRatingChanged = (event: InputEvent): void => {
    // Go through the checked input of the particular field and union their result
    // If the union is an empty set then get the original result

    const inputs = (event.currentTarget as HTMLElement).querySelectorAll(
      "input"
    );
    let filteredFieldProductIDs: Set<ProductID> = new Set();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.checked) continue;

      // Check if input filterd product is cached
      let filteredInputProductIDs: ProductID[] = [];
      if (this._ratingFilteredProductsCache.has(input.value)) {
        filteredInputProductIDs = this._ratingFilteredProductsCache.get(
          input.value
        )!;
      } else {
        filteredInputProductIDs = this._reviewService!.getIDsByRating(
          Number(input.value)
        );
        this._ratingFilteredProductsCache.set(
          input.value,
          filteredInputProductIDs
        );
      }

      filteredFieldProductIDs = new Set([
        ...filteredFieldProductIDs,
        ...filteredInputProductIDs!,
      ]); // Performing Union
    }

    this._ratingsFilteredProducts = [...filteredFieldProductIDs];
    this._dispatchFilterEvent();
  }

  private _intersectFilters(arr1: ProductID[], arr2: ProductID[]): ProductID[] {
    const set = new Set(arr2);
    return arr1.filter((value) => set.has(value));
  }

  private _dispatchFilterEvent(): void {
    // Takes the intersect of the each field's filtered result and dispatch it with a filter-change event

    const filteredProducts = [
      this._categoryFilteredProducts,
      this._collectionFilteredProducts,
      this._colorsFilteredProducts,
    ].reduce(
      (prev, curr) => this._intersectFilters(prev, curr),
      this._ratingsFilteredProducts
    ); // P
    //
    // Performing filter intersection
    this._filteredProducts = filteredProducts;
    const filterEvent = new CustomEvent("filter-change", {
      composed: true,
      bubbles: true,
      detail: { filteredProductIDs: this._filteredProducts },
    });

    this.dispatchEvent(filterEvent);
  }

  private _resetFilter = (): void => {
    this._numberOfFiltersApplied = 0;
    this._ratingsFilteredProducts = this.globalFilteredProducts;
    this._colorsFilteredProducts = this.globalFilteredProducts;
    this._categoryFilteredProducts = this.globalFilteredProducts;
    this._filteredProducts = this.globalFilteredProducts;

    const filterEvent = new CustomEvent("filter-change", {
      composed: true,
      bubbles: true,
      detail: { filteredProductIDs: this._filteredProducts },
    });

    this.dispatchEvent(filterEvent);
  };

  private _closeDockedFilter = (): void => {
    const closeEvent = new CustomEvent("close-docked-filter", {
      composed: true,
      bubbles: true,
    });
    this.dispatchEvent(closeEvent);
  };

  static productFilterSkeletonStyle = css`
    .sn-product-filter-skeleton {
      display: grid;
      row-gap: 20px;

      animation-name: pulse;
      animation-duration: 2s;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-fill-mode: both;

      .field {
        display: grid;
        row-gap: 15px;
      }

      .legend {
        width: 15ch;
        height: 20px;
        background-color: gray;
        border-radius: 5px;
      }

      .inputs {
        display: grid;
        row-gap: 10px;
      }

      .field-input {
        --width: 13ch;
        width: var(--width);
        height: 15px;
        background-color: gray;
        border-radius: 5px;

        &:nth-of-type(2n + 1) {
          --width: 10ch;
        }
      }
    }

    @keyframes pulse {
      0% {
        opacity: 0.3;
      }

      50% {
        opacity: 0.7;
      }

      100% {
        opacity: 0.3;
      }
    }
  `;

  static productFilterSkeleton() {
    return html`<div class="sn-product-filter-skeleton">
      <div class="field">
        <div class="legend"></div>
        <div class="inputs">
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
        </div>
      </div>
      <div class="field">
        <div class="legend"></div>
        <div class="inputs">
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
        </div>
      </div>
      <div class="field">
        <div class="legend"></div>
        <div class="inputs">
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
        </div>
      </div>
      <div class="field">
        <div class="legend"></div>
        <div class="inputs">
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
          <div class="field-input"></div>
        </div>
      </div>
    </div>`;
  }

  protected render(): unknown {
    return html`
      <nav>
        <span class="header"> Filter </span>
        <button
          @click=${this._closeDockedFilter}
          aria-label="close"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="16"
          >
            <path
              d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
            ></path>
          </svg>
        </button>
      </nav>
      <hr />
      <form @reset=${this._resetFilter}>
        <details open>
          <summary>
            <span>Collection</span><span class="summary-button"></span>
          </summary>
          <fieldset @input=${(event: any) => this._onCollectionChanged(event)}>
            <legend class="sr-only">Collection</legend>
            <div class="inputs">
              <div class="input-container">
                <input
                  type="checkbox"
                  value="latest"
                  class="input"
                  id="latest"
                />
                <label for="latest">Latest Arrival</label>
              </div>
              ${repeat(
                this._productService!.getAllCollections(),
                (collection) => collection,
                (collection) => {
                  return html`
                    <div class="input-container">
                      <input
                        type="checkbox"
                        value="${collection}"
                        class="input"
                        id=${collection}
                        @input=${this._onInputChanged}
                      />
                      <label for=${collection}
                        >${this._collectionNames[collection]}</label
                      >
                    </div>
                  `;
                }
              )}
            </div>
          </fieldset>
        </details>
        <hr />
        <details open>
          <summary>
            <span>Category</span><span class="summary-button"></span>
          </summary>
          <fieldset @input=${(event: any) => this._onCategoryChanged(event)}>
            <legend class="sr-only">Category</legend>
            <div class="inputs">
              ${repeat(
                this._productService!.getAllCategories(),
                (category) => category,
                (category) => {
                  return html`
                    <div class="input-container">
                      <input
                        type="checkbox"
                        value="${category}"
                        class="input"
                        id=${category}
                        @input=${this._onInputChanged}
                      />
                      <label for=${category}>${category}</label>
                    </div>
                  `;
                }
              )}
            </div>
          </fieldset>
        </details>
        <hr />
        <details open>
          <summary>
            <span>Colors</span><span class="summary-button"></span>
          </summary>
          <fieldset @input=${(event: any) => this._onColorChanged(event)}>
            <legend class="sr-only">Colors</legend>
            <div class="colors-container">
              ${repeat(
                this._inventoriesService!.getAllColors(),
                (color) => color,
                (color) => html` <label for=${color}>
                  <input
                    class="sr-only color"
                    id=${color}
                    type="checkbox"
                    name="color"
                    value=${color}
                    @input=${this._onInputChanged}
                  />
                  <span
                    style="background-color: ${color}"
                    class="color-swatch"
                  ></span>
                  <span class="sr-only">${color}</span></label
                >`
              )}
            </div>
          </fieldset>
        </details>
        <hr />
        <details open>
          <summary>
            <span>Ratings</span><span class="summary-button"></span>
          </summary>
          <fieldset @input=${this._onRatingChanged}>
            <legend class="sr-only">Ratings</legend>

            <div class="inputs ratings">
              ${[5, 4, 3, 2, 1].map((index) => {
                return html`<label for=${`rating-${index}`}>
                  <input
                    type="checkbox"
                    value=${index}
                    id=${`rating-${index}`}
                    class="sr-only"
                    @input=${this._onInputChanged}
                  />
                  <sn-ratings-read-only
                    aria-hidden="true"
                    ratings=${index}
                  ></sn-ratings-read-only>
                  <span class="sr-only">${`${index} star rating`}</span>
                </label>`;
              })}
            </div>
          </fieldset>
        </details>
        <hr />
        ${this._hasAFilterApplied
          ? html`<button type="reset">
              Clear All ${this._numberOfFiltersApplied}
            </button>`
          : nothing}
      </form>
    `;
  }
}
