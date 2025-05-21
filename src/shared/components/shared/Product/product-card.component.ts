import { css, html, LitElement, nothing } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import { ProductID, ProductName } from "../../../../services/products.service";

import { ProductFirstImageWithColor } from "../../../../services/product-images.service";

import { ProductColor } from "../../../../services/inventory.service";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { getFilePathWithoutExtension } from "../../../utils/getFilePathWithoutExt";
import { resolveUrl } from "../../../directives/resolve-url.directive";
import "../Galleries/gallery-slider.component";
import "../Galleries/image.component";
import "../Links/base-link/base-link.component"

export type ProductCardItem = {
  product_id: ProductID;
  product_name: ProductName;
  colors: ProductColor[];
  images: ProductFirstImageWithColor[];
  sale_price: string;
  list_price: string;
};

export const shareableStyle = css`
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .product-card-container {
    display: grid;
    row-gap: 5px;
    padding: clamp(5px, 6%, 15px);
    border-radius: 12px;
  }

  .color {
    margin-top: 10px;
  }

  .price-container {
    margin-bottom: 5px;
    margin-top: 10px;
  }

  .colors-container {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }

  .color-swatch {
    display: block;
    width: 20px;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  .gallery {
    width: 100%;
    --aspect-ratio: 1 / 1.1;
    aspect-ratio: var(--aspect-ratio);
  }
`;

@customElement("sn-product-card")
export class SNProductCard extends LitElement {
  static styles = [
    shareableStyle,

    css`
      .product-card-container {
        text-transform: capitalize;
        color: #797979;
        position: relative;
        outline: 2px solid transparent;
        will-change: outline;

        &:has(fieldset:focus-within) {
          outline: 2px solid transparent;
        }

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }
      }

      .product-card-container:hover,
      .product-card-container:focus-within {
        transform: translateY(-4px);
      }

      .product-card-container:focus-within {
        outline: 2px solid black;
      }

      .product-card-container:hover sn-img::part(img-container),
      .product-card-container:focus-within sn-img::part(img-container) {
        transform: scale(1.1);
      }

      sn-img::part(img-container) {
        transform: scale(1);
        will-change: transform;
        width: 100%;
        aspect-ratio: var(--aspect-ratio);

        @media (prefers-reduced-motion: no-preference) {
          transition: transform 500ms ease-in-out, opacity 500ms ease-in-out;
        }
      }

      .color {
        font-size: 0.8rem;
      }

      sn-link::part(a) {
        font-size: 1.1rem;
        font-weight: 600;
        color: black;
      }

      sn-link::part(a)::before {
        content: "";
        position: absolute;
        inset: 0;
      }

      sn-link::part(a):active {
        background-color: transparent;
      }

      sn-link::part(a):focus-visible,
      sn-link::part(a):hover {
        outline-color: transparent;
        outline-offset: 0;
        outline-width: 0;
      }

      .price-container {
        margin-bottom: 5px;
        margin-top: 10px;

        display: flex;
        align-items: center;
        column-gap: 7px;
      }

      .list-price {
        font-size: 0.7rem;
        text-decoration: line-through;
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        top: auto;
        overflow: hidden;
      }

      label {
        position: relative;
        display: inline-block;
      }

      fieldset {
        border: none;
        margin: 0;
        padding: 0;
        min-inline-size: unset;
        outline-offset: 0px;
        outline-color: transparent;
        outline-width: 2px;
        outline-style: solid;
        will-change: outline-offset, outline-color;
        width: fit-content;

        border-radius: 5px;

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }

        &:focus-within {
          outline-offset: 4px;
          outline-color: black;
        }
      }

      .color-swatch {
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

      .color-swatch:hover {
        outline-color: #959595;
        outline-width: 3px;
      }

      input[type="radio"] {
        &:checked + .color-swatch {
          outline-color: #00b01d;
          outline-width: 3px;
        }

        &:disabled + .color-swatch {
          outline-color: transparent;
        }
      }
    `,
  ];
  @property({ type: Object })
  productItem?: ProductCardItem;

  @property()
  selectedColor?: string;

  @queryAll("input[name='color']")
  private _colorInputs?: NodeListOf<HTMLInputElement>;

  protected firstUpdated(): void {
    this._colorInputs?.forEach((colorInput) => {
      colorInput.addEventListener("change", (e) => {
        this.selectedColor = (e.target as HTMLInputElement).value;
      });
    });
  }

  protected render() {
    return html`
      <div class="product-card-container">
        <sn-gallery-slider aria-live="polite" class="gallery">
          ${this.productItem?.images.map(
            (image) =>
              html`<sn-img
                placeholder=${resolveUrl(
                  getFilePathWithoutExtension(image.image) + "_20px.webp"
                )}
                class=${classMap({
                  active: this.selectedColor === image.color,
                })}
              >
                <img
                  style="object-fit: cover; object-position: center; width: 100%; height: 100%;"
                  width="200"
                  loading="lazy"
                  alt=${ifDefined(this.productItem?.product_name)}
                  src=${resolveUrl(image.image)}
                />
              </sn-img>`
          )}
        </sn-gallery-slider>
        <span class="color">${this.selectedColor}</span>
        <sn-link class="name">${this.productItem?.product_name}</sn-link>
        <div class="price-container">
          <span class="sale-price">${this.productItem?.sale_price}</span>
          ${this.productItem?.sale_price === this.productItem?.list_price
            ? nothing
            : html`<span class="list-price"
                >${this.productItem?.list_price}</span
              >`}
        </div>
        <form>
          <fieldset>
            <legend class="sr-only">Choose color:</legend>
            <div class="colors-container">
              ${this.productItem?.colors.map((color, _, colors) => {
                return html`
                  <label>
                    <input
                      class="sr-only"
                      id=${color}
                      type="radio"
                      name="color"
                      value=${color}
                      ?disabled=${colors.length == 1}
                      ?checked=${color === this.selectedColor}
                    />
                    <span
                      style="background-color: ${color}"
                      class="color-swatch"
                    ></span>
                    <span class="sr-only">${color}</span></label
                  >
                `;
              })}
            </div>
          </fieldset>
        </form>
      </div>
    `;
  }
}
