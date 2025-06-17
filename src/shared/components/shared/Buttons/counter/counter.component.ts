import { css, CSSResultGroup, html, LitElement, PropertyValues } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("sn-counter")
export class SNCounter extends LitElement {
  static styles = css`
    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    :host {
      font-size: inherit;
      font-family: inherit;
    }

    .sr-only {
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      top: auto;
      overflow: hidden;
    }

    .counter-container {
      display: flex;
      align-items: stretch;
      outline: 2px solid transparent;
      border: 2px solid #e9e9e9;
      border-radius: 0.2em;
      outline-offset: 4px;
      width: fit-content;
      background-color: #fafafa;

      will-change: outline-color;

      &:focus-within {
        outline-color: black;
      }

      @media (prefers-reduced-motion: no-preference) {
        transition: all 200ms ease-in-out;
      }
    }

    button {
      background-color: transparent;
      border: none;
      outline: none;
      padding: 0.8em 1em;
      user-select: none;

      &:focus-visible,
      &:hover {
        background-color: #ececec;
      }

      &:hover {
        cursor: pointer;
      }

      &:disabled {
        cursor: not-allowed;
        background-color: transparent !important;
        
        svg {
          fill: gray;
        }
      }

       @media (prefers-reduced-motion: no-preference) {
        transition: all 200ms ease-in-out;
      } 
    }

    svg {
      fill: black;
      width: 20px;
    }
  `;
  @property({ type: Number })
  availableStocks!: number;

  @state()
  private _value = 1;

  @queryAssignedElements({ slot: "input" })
  private _inputs!: Array<HTMLInputElement>;

  @query("#sr-announcer")
  private _announcerElem!: HTMLSpanElement;

  private _announce(message: string): void {
    this._announcerElem.textContent = message;
  }

  private _setInputValue(value: string): void {
    this._value = Number(value);
    this._inputs[0].value = value;
  }

  protected firstUpdated(): void {
    if (this.availableStocks === 0)
      this._setInputValue("0");
    else
      this._setInputValue("1");
    this._inputs[0].addEventListener("change", this._onInputChange);
  }

  private _onIncreaseQuantity = (): void => {
    const newValue = this._wrapQuantity(Number(this._inputs[0].value) + 1);
    this._setInputValue(String(newValue));
    this._announce(`Current quantity: ${newValue}`);
  };

  private _onDecreaseQuantity = (): void => {
    const newValue = this._wrapQuantity(Number(this._inputs[0].value) - 1);
    this._setInputValue(String(newValue));
    this._announce(`Current quantity: ${newValue}`);
    console.log('clicked')
  };

  private _wrapQuantity(newValue: number): number {
    if (newValue > this.availableStocks) return this.availableStocks;
    if (newValue <= 0) return 1;
    return newValue;
  }

  private _onInputChange = (event: Event): void => {
    const newValue = this._wrapQuantity(
      Number((event.currentTarget as HTMLInputElement).value)
    );
    this._setInputValue(String(newValue));
  };

  protected render() {
    return html`
      <div
        class=${classMap({
          disabled: this._value === this.availableStocks,
          container: true,
        })}
        aria-label=${`choose your quantity. Available stocks is ${this.availableStocks}`}
      >
        <slot name="label"></slot>
        <div class="counter-container">
          <button
            @click=${this._onDecreaseQuantity}
            type="button"
            aria-label="decrease quantity"
            ?disabled=${this._value === 1 || this.availableStocks === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 11V13H19V11H5Z"></path>
            </svg>
          </button>
          <slot name="input"></slot>
          <button
            @click=${this._onIncreaseQuantity}
            type="button"
            aria-label="increase quantity"
            ?disabled=${this._value === this.availableStocks || this.availableStocks === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
            </svg>
          </button>
        </div>
        <span class="sr-only" id="sr-announcer" aria-live="polite"></span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-counter": SNCounter;
  }
}
