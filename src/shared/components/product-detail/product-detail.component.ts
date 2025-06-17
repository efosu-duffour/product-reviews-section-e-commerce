import { css, html, LitElement, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Product } from "../../../services/products.service";
import {
  DiscountPerct,
  Inventory,
  InventoryService,
  Price,
  ProductColor,
  Size,
  Stock,
} from "../../../services/inventory.service";
import {
  ImageUrl,
  ProductImage,
  ProductImagesService,
} from "../../../services/product-images.service";
import { ProductInfo } from "../../../services/product-info.service";
import { resolveUrl } from "../../directives/resolve-url.directive";
import { getFilePathWithoutExtension } from "../../utils/getFilePathWithoutExt";
import { classMap } from "lit/directives/class-map.js";
import "../shared/Galleries/gallery-slider.component";
import "../shared/Galleries/image.component";
import "../shared/Buttons/counter/counter.component";
import "../shared/Ratings/ratings-read-only.component";
import addFill from "/add-circle-line.svg";
import substractFill from "/subtract-fill.svg";
import checkLineSvg from "/check-line.svg";

const addFillUrl = `url("${addFill}")`;
const substractFillUrl = `url("${substractFill}")`;

@customElement("sn-product-detail")
export class SNProductDetail extends LitElement {
  static styles = [
    css`
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }
      :host {
        display: block;
        container-type: inline-size;
        container-name: product-detail-host;
        font-size: clamp(0.8rem, 4vw, 1rem);
      }
      .container {
        display: grid;
        grid-template-columns: minmax(400px, 1fr) 1fr;
        gap: 50px;
      }

      .carousal-container {
        display: grid;
        align-self: flex-start;
        gap: 15px;
      }

      sn-gallery-slider {
        aspect-ratio: 1 / 1.4;
        width: 100%;

        sn-img {
          aspect-ratio: 1 / 1.4;
        }
      }

      .mini-markers {
        display: flex;
        flex-wrap: nowrap;
        gap: 10px;
        overflow-x: scroll;
        overflow-y: hidden;
        /* scrollbar-gutter: stable none; */
        scroll-snap-type: x proximity;
        scroll-snap-align: center;

        /* @supports (scrollbar-color: red blue) {
          scrollbar-color:  #d1d1d1 transparent;
          scrollbar-width: thin;
        } */

        &:hover::-webkit-scrollbar {
          display: initial;
        }

        &::-webkit-scrollbar {
          height: 6px;
          display: none;
        }

        &::-webkit-scrollbar-thumb {
          background-color: #d1d1d1;
          border-radius: 100vw;
        }
        &::-webkit-scrollbar-thumb:hover {
          background-color: #6d6d6d;
        }

        &::-webkit-scrollbar-track {
          background-color: transparent;
        }

        [role="radio"] {
          width: 24%;
          min-width: 90px;
          max-width: 24%;
          flex: 1 0 120px; /* Grow, shrink, base width */
          aspect-ratio: 1 / 1.3;
          border: 2.5px solid transparent;
          border-radius: 5px;
          overflow: clip;
          will-change: outline-color;
          transition: all 200ms ease-in-out;

          &:focus-visible,
          &:hover {
            border-color: #938ee0;
          }

          &.checked {
            border-color: #4f45e5;
          }

          sn-img {
          }
        }
      }

      .info {
        display: grid;
        gap: 10px;
      }

      h1 {
        font-family: inherit;
        font-size: clamp(2rem, 5vw, 2.5rem);
      }

      .price-container {
        margin: 5px 0px;
        display: flex;
        flex-direction: column;
      }

      .price {
        font-weight: 600;
        font-size: 1.5rem;
        color: #515151;
      }

      .list-price {
        display: inline-block;
        margin-left: 10px;
        color: #a2a2a2;
        font-size: 0.8rem;
        text-decoration: line-through;
      }

      .discount {
        background-color: #fefbea;
        color: #bb621c;
        padding: 0.4em 0.8em;
        border-radius: 100px;
        width: fit-content;
        font-size: 0.8rem;
        border: 2px solid #fdea9c;
        font-weight: 600;
        margin-top: 5px;
      }

      .rating-container {
        display: flex;
        align-items: center;
        gap: 15px;

        :has(a),
        a {
          font-size: 0.8rem;
        }

        a {
          text-decoration: none;
        }
      }

      p {
        margin-top: 10px;
        line-height: 1.5;
        color: #444444;
      }

      fieldset {
        border: none;

        > div {
          outline: 2px solid transparent;
          border-radius: 5px;
          outline-offset: 4px;
          width: fit-content;

          will-change: outline-color;

          &:focus-within {
            outline-color: black;
          }

        

          @media (prefers-reduced-motion: no-preference) {
            transition: all 200ms ease-in-out;
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        cursor: pointer;
        user-select: none;
      }

      .colors-container {
        display: flex;
        align-items: center;
        column-gap: 10px;
      }

      .color-swatch {
        display: block;
        width: 35px;
        aspect-ratio: 1;
        border-radius: 50%;
        outline-width: 2px;
        outline-offset: 2px;
        outline-color: transparent;
        outline-style: solid;
        border: 1px gray solid;
        will-change: outline-color;
        margin: 0;
        position: relative;

        &::after {
          position: absolute;
          content: "";
          inset: 0;
          scale: 1.3;
          aspect-ratio: 1 / 1;
          background-image: ${unsafeCSS(`url("${checkLineSvg}")`)};
          background-repeat: no-repeat;
          background-position: center;
          background-size: 75%;
          border-radius: 100px;
          opacity: 0;
          user-select: none;
          pointer-events: none;

          @media (prefers-reduced-motion: no-preference) {
            transition: all 200ms ease-in-out;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        top: auto;
        overflow: hidden;
      }

      input:focus-visible + .color-swatch,
      .color-swatch:hover {
        outline-color: #959595;
      }

      .color {
        &[checked] + .color-swatch {
          outline-color: #4049e7;
        }

        &[checked] + .color-swatch::after {
          opacity: 1;
        }

        &[disabled] + .color-swatch {
          cursor: not-allowed;
        }
      }

      .out-of-stock + .color-swatch::after {
        /* Needs to change the background */
        background-color: red;
      }

      form {
        margin-top: 40px;
        display: grid;
        gap: 35px;

        legend,
        [slot="label"] {
          user-select: none;
          color: #595959;
          margin-bottom: 15px;
        }

        .colors {
          display: flex;
          gap: 20px;
        }

        .sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          user-select: none;

          text-transform: uppercase;

          .label {
            display: flex;
            height: 45px;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1.3 / 1;
            border-radius: 0.3em;
            border: 2px solid #e6e6e6;

            @media (prefers-reduced-motion: no-preference) {
              transition: all 200ms ease-in-out;
            }
          }

          input:focus-visible + .label,
          .label:hover {
            border-color: #959595;
          }

          input:checked + .label {
            border-color: #5248e5 !important;
          }

          input:disabled + .label {
            color: #9b9b9b;
            background-color: #fafafa;
            border: none;
            cursor: not-allowed;
          }
        }
      }

      input[type="number"] {
        min-width: 3ch;
        text-align: center;
        width: 8ch;
        border: none;
        background-color: transparent;

        &:focus-visible {
          outline: none;
        }
      }

      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }

      details {
        display: grid;
        padding: 30px 0px;
        color: #595959;

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
        color: black;

        &:hover {
          cursor: pointer;
        }

        &::-webkit-details-marker {
          display: none;
        }
      }

      .features-container {
        ul {
          padding-left: 15px;
          > * + * {
            margin-top: 5px;
          }

          li {
            margin-left: 10px;
          }
        }
      }

      button[type="submit"] {
        border: none;
        padding: 0.65em;
        border-radius: 0.2em;
        font-size: inherit;
        font-family: inherit;
        cursor: not-allowed;

        &:not(:disabled) {
          background-color: #4438ca;
          color: white;
          font-size: inherit;
          font-family: inherit;
          outline-offset: 3px;

          &:hover {
            background-color: #4f44f3;
            cursor: pointer;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }
      }

      .features-container {
        margin-top: 30px;

        > * + * {
          border-top: 2px solid #e7e7e7;
        }
      }

      @container product-detail-host (max-width: 700px) {
        .container {
          grid-template-columns: 1fr;
        }
      }

      span.out-of-stock {
        font-weight: bold;
      }

      [hidden] {
        display: none;
      }
    `,
  ];

  @property({ type: Array, attribute: false })
  productInventories: Inventory[] = [];

  @property({ type: Object, attribute: false })
  product = {} as Product;

  @property({ type: Number })
  numberOfReviews: number = 0;

  @property({ type: Number })
  ratings: number = 0;

  @property({ type: Array, attribute: false })
  product_infos = {} as ProductInfo[];

  @property({ type: Array, attribute: false })
  product_images = [] as ProductImage[];

  @state()
  private _selectedColor: ProductColor = "";

  @state()
  private _selectedSize: Size = "";

  @state()
  private _selectedImageIdx: number = 0;

  private _colors: ProductColor[] = [];
  private _sizes: Size[] = [];

  private _availableStocks: Stock = 88;

  private _sizesName: Record<
    NonNullable<Size>,
    { name: string; shortName: string }
  > & {
    [a: string]: { name: string; shortName: string };
  } = {
    xs: { name: "extra small", shortName: "xs" },
    sm: { name: "small", shortName: "s" },
    md: { name: "medium", shortName: "m" },
    lg: { name: "large", shortName: "l" },
    xl: { name: "extra large", shortName: "xl" },
  };

  private _getAvailableColors(inventories: Inventory[]): ProductColor[] {
    return InventoryService.getAllColors(inventories);
  }

  private _getAvailableSizes(
    inventories: Inventory[],
    color: ProductColor
  ): Size[] {
    return InventoryService.getSizesByColor(inventories, color);
  }

  private _getProductStock(
    inventories: Inventory[],
    size: Size,
    color: ProductColor
  ): Stock {
    return InventoryService.getStock(inventories, size, color);
  }

  private _getProductListPrice(inventories: Inventory[], size: Size): Price {
    return InventoryService.getListPrice(inventories, size);
  }

  private _getProductSalePrice(inventories: Inventory[], size: Size): Price {
    return InventoryService.getSalePrice(inventories, size);
  }

  private _getProductImages(
    productImages: ProductImage[],
    color: ProductColor
  ): ImageUrl[] {
    return ProductImagesService.getImages(productImages, color);
  }

  private _getDiscount(inventories: Inventory[], size: Size): DiscountPerct {
    return InventoryService.getDiscount(inventories, size);
  }

  private _init() {
    this._colors = this._getAvailableColors(this.productInventories);
    this._selectedColor = this._colors[0];

    this._sizes = this._getAvailableSizes(
      this.productInventories,
      this._selectedColor
    );
    this._selectedSize = this._sizes[0];
  }

  private _updateSelectedImage(event: MouseEvent): void {
    const selectedInput = event.target as HTMLDivElement;
    this._selectedImageIdx = Number(selectedInput.dataset["index"]);
  }

  private _updateSelectedSize(event: InputEvent): void {
    const selectedValue = (event.target as HTMLInputElement).value;
    this._selectedSize = selectedValue;
  }

  private _updateSelectedColor(event: InputEvent): void {
    const selectedValue = (event.target as HTMLInputElement).value;
    this._selectedImageIdx = 0;
    this._selectedColor = selectedValue;
  }

  private _addToCart = (event: SubmitEvent): void => {
    event.preventDefault();
  };

  connectedCallback(): void {
    super.connectedCallback();
    this._init();
  }

  protected render() {
    const images = this._getProductImages(
      this.product_images,
      this._selectedColor
    );
    const salePrice = this._getProductSalePrice(
      this.productInventories,
      this._selectedSize
    );
  
    const listPrice = this._getProductListPrice(
      this.productInventories,
      this._selectedSize
    );
    const discountPercentage = this._getDiscount(
      this.productInventories,
      this._selectedSize
    );

    return html`
      <div class="container">
        <div class="carousal-container">
          <sn-gallery-slider aria-live="polite" class="gallery">
            ${images.map(
              (image, idx) => html`
                <sn-img
                  placeholder=${resolveUrl(
                    getFilePathWithoutExtension(image) + "_20px.webp"
                  )}
                  class=${classMap({ active: this._selectedImageIdx === idx })}
                >
                  <img
                    style="object-fit: cover; object-position: center; "
                    width="200"
                    loading="lazy"
                    alt=${`${this._selectedColor} ${image} ${idx}`}
                    src=${resolveUrl(image)}
                  />
                </sn-img>
              `
            )}
          </sn-gallery-slider>
          <div class="mini-markers">
            ${images.map(
              (image, idx) =>
                html`
                  <div
                    @click=${this._updateSelectedImage}
                    role="radio"
                    class=${classMap({
                      checked: this._selectedImageIdx === idx,
                    })}
                    tabindex="0"
                  >
                    <sn-img
                      placeholder=${resolveUrl(
                        getFilePathWithoutExtension(image) + "_20px.webp"
                      )}
                    >
                      <img
                        data-index=${idx}
                        style="object-fit: cover; object-position: center; width: 100%; height: 100%;"
                        width="200"
                        loading="lazy"
                        alt=${`${this._selectedColor} ${this.product.name} ${idx}`}
                        src=${resolveUrl(image)}
                      />
                    </sn-img>
                  </div>
                `
            )}
          </div>
        </div>
        <div class="content-container">
          <div class="info">
            <h1>${this.product.name}</h1>
            <div class="price-container">
              <span class="price"
                >$${salePrice}<span
                  ?hidden=${salePrice === listPrice}
                  class="list-price"
                  >$${listPrice}</span
                ></span
              >
              <span ?hidden=${salePrice === listPrice} class="discount"
                >${discountPercentage}% OFF</span
              >
            </div>
            <div class="rating-container">
              <span class="rating-number"
                >${Number(this.ratings.toFixed(1))}</span
              >
              <sn-ratings-read-only
                ratings=${Number(this.ratings.toFixed(1))}
              ></sn-ratings-read-only>
              ${this.numberOfReviews === 0
                ? html`
                    <span>No reviews yet. <a href="#">Be the first</a></span>
                  `
                : html`
                    <a href="#">See all ${this.numberOfReviews} reviews</a>
                  `}
            </div>
            <p>${this.product.description}</p>
          </div>
          <form @submit=${this._addToCart}>
            <fieldset @input=${this._updateSelectedColor}>
              <legend>Available colors</legend>
              <div class="colors">
                ${this._colors.map((color, _, colors) => {
                  return html`
                    <label for=${color}>
                      <input
                        class=${classMap({
                          "sr-only": true,
                          color: true,
                          "out-of-stock": this._availableStocks === 0,
                        })}
                        id=${color}
                        type="radio"
                        name="color"
                        value=${color}
                        ?disabled=${colors.length == 1}
                        ?checked=${color === this._selectedColor}
                      />
                      <div
                        style="background-color: ${color}"
                        class="color-swatch"
                      ></div>
                      <span class="sr-only">${color}</span></label
                    >
                  `;
                })}
              </div>
            </fieldset>
            <fieldset
              ?hidden=${this._sizes.length === 0}
              @input=${this._updateSelectedSize}
            >
              <legend>Available Sizes</legend>
              <div class="sizes">
                ${this._sizes.map((size) => {
                  return html`
                    ${!size
                      ? nothing
                      : html`
                          <label for=${String(size)}>
                            <input
                              ?disabled=${this._availableStocks === 0}
                              class=${classMap({
                                "sr-only": true,
                              })}
                              id=${String(size)}
                              type="radio"
                              name="size"
                              value=${String(size)}
                              ?checked=${size === this._selectedSize}
                            />
                            <span
                              class="label"
                              aria-label=${typeof size === "number"
                                ? size
                                : this._sizesName[size!].shortName}
                              >${typeof size === "number"
                                ? size
                                : this._sizesName[size!].shortName}</span
                            ></label
                          >
                        `}
                  `;
                })}
              </div>
            </fieldset>
            <sn-counter availableStocks=${this._availableStocks}>
              <label for="quantity" slot="label">Quantity</label>
              <input
                autocomplete="off"
                slot="input"
                id="quantity"
                name="quantity"
                type="number"
                ?disabled=${this._availableStocks === 0}
                inputmode="numeric"
              />
            </sn-counter>
            <span class="out-of-stock" ?hidden=${!(this._availableStocks === 0)}
              >Sorry, this product is out of stock</span
            >
            <button type="submit" ?disabled=${this._availableStocks === 0}>
              Add to Cart
            </button>
          </form>
          <div class="features-container">
            ${this.product_infos.map(
              (info) =>
                html`
                  <details open>
                    <summary>
                      ${info.title} <span class="summary-button"></span>
                    </summary>
                    <ul>
                      ${info.description.map(
                        (desc) => html` <li>${desc}</li> `
                      )}
                    </ul>
                  </details>
                `
            )}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-product-detail": SNProductDetail;
  }
}
