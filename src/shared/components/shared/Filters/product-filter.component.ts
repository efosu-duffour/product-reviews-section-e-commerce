import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  inventoriesServiceContext,
  productServiceContext,
} from "../../../../services/context";
import { InventoryService } from "../../../../services/inventory.service";
import { Task } from "@lit/task";
import { repeat } from "lit/directives/repeat.js";
import { ProductsService } from "../../../../services/products.service";

type indexable = {
  [a: string]: string;
};

@customElement("sn-product-filter")
export class SNProductFilter extends LitElement {
  static styles = [
    css`
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

      label {
        position: relative;
        display: inline-block;
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

      .color-swatch:hover {
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
    `,
  ];
  @consume({ context: inventoriesServiceContext })
  private _inventoriesService?: InventoryService;

  @consume({ context: productServiceContext })
  private _productService?: ProductsService;

  @property({ type: Boolean, attribute: false })
  private _isResolved!: boolean;

  private _fieldsTask = new Task(this, {
    task: async ([resolved]) => {},
    args: () => [this._isResolved],
  });

  private _collectionNames: indexable = {
    cozy: "Cozy Comfort",
    urban: "Urban Oasis",
    fresh: "Fresh Fusion",
  };
  private _componentSkeleton() {
    return html`Skeleton`;
  }
  protected render(): unknown {
    return this._fieldsTask.render({
      complete: (value) => {
        return html`
          <form>
            <fieldset>
              <legend>Collections</legend>
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
                      />
                      <label for=${collection}
                        >${this._collectionNames[collection]}</label
                      >
                    </div>
                  `;
                }
              )}
            </fieldset>
            <fieldset>
              <legend>Category</legend>
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
                      />
                      <label for=${category}>${category}</label>
                    </div>
                  `;
                }
              )}
            </fieldset>
            <fieldset>
              <legend>Colors</legend>
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
            <fieldset>
              <legend>Ratings</legend>
            </fieldset>
          </form>
        `;
      },
      initial: () => this._componentSkeleton(),
      pending: () => this._componentSkeleton(),
    });
  }
}
