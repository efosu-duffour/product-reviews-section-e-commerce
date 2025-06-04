import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";

@customElement("sn-sort-by")
export class SNSortBy extends LitElement {
  static styles = [
    css`
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      :host {
        font-size: clamp(0.8rem, 3vw, 0.9rem);
        font-family: inherit;
      }

      :host:has(dialog[open]) svg {
        transform: rotate(180deg);
      }

      button {
        user-select: none;
        font-size: inherit;
        font-family: inherit;
        padding: 0.5em 0.7em;
        background-color: white;
        border: none;
        white-space: nowrap;
        position: relative;

        &[aria-haspopup="dialog"] {
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

        &.sort-selected .badge {
          opacity: 1;
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

      .input-container {
        display: grid;
        text-transform: capitalize;
        padding-block: 5px;
        border: none;
        
        button {
          text-align: left;
          text-transform: capitalize;
          outline: none;
          @media (prefers-reduced-motion: no-preference) {
            transition: all 200ms ease-in-out;
          }

          &:hover,
          &:focus-visible {
            background-color: #e4e4e4;
          }

          &.checked {
            background-color: #d4edfc;
          }
        }
      }

      .badge {
        width: 12px;
        aspect-ratio: 1 / 1;
        background-color: blue;
        border-radius: 100%;
        position: absolute;
        top: 0px;
        right: 0px;
        opacity: 0;

        @media (prefers-reduced-motion: no-preference) {
          transition: opacity 200ms ease-in-out;
        }
      }

      dialog {
        border: none;
        border-radius: 0.5em;
        box-shadow: 0 3px 4px #00000022;
        position: absolute;

        &::backdrop {
          background-color: #9292921c;
          backdrop-filter: blur(2px);
        }
      }

      [aria-haspopup="dialog"] {
        display: flex;
        align-items: center;
        column-gap: 5px;

        svg {
          transform-origin: center;
        }
      }
    `,
  ];
  @property({ type: Object, attribute: false })
  sorts = new Map<string, string>();

  @query("dialog")
  private _popoverForm!: HTMLDialogElement;

  @state()
  private _currentSort?: string;

  @query("button")
  private _popoverButton!: HTMLButtonElement;

  private _dispatchSortChange(): void {
    const sortChangeEvent = new CustomEvent("sort-change", {
      bubbles: true,
      composed: true,
      detail: { sort: this._currentSort },
    });
    this.dispatchEvent(sortChangeEvent);
  }

  private _onSortSelected = (event: InputEvent): void => {
    const selectedSortInput = event.target as HTMLElement;
    this._currentSort = selectedSortInput.dataset["value"];
    this._closeFormDialog();
    this._dispatchSortChange();
  };

  private _closeFormDialog(): void {
    this._popoverForm.close();
    this._popoverButton.focus();
  }

  private _showFormDialog = (): void => {
    this._popoverForm.showModal();
    this._setDialogPosition();
  };

  private _setDialogPosition(): void {
    const rect = this._popoverButton.getBoundingClientRect();
    this._popoverForm.style.left = `${
      rect.left - (this._popoverForm.clientWidth - rect.width)
    }px`;
    this._popoverForm.style.top = `${rect.bottom + window.scrollY + 5}px`;
  }

  firstUpdated(): void {
    this._popoverButton.addEventListener("click", () => {
      this._showFormDialog();
    });

    window.addEventListener("resize", () => {
      this._setDialogPosition();
    });
  }

  protected render(): unknown {
    return html`
      <button
        class=${classMap({ "sort-selected": this._currentSort ?? false })}
        type="button"
        aria-haspopup="dialog"
        aria-controls="sort-form"
      >
        Sort by
        <svg
          width="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"
          ></path>
        </svg>
        <div class="badge"></div>
      </button>
      <dialog closedby="any" id="sort-form" aria-labelledby="sortLabel">
        <div class="input-container" role="menu" @click=${this._onSortSelected}>
          ${repeat(
            this.sorts!.entries(),
            (sort) => sort[0],
            (sort) => {
              return html`
                <button
                  class=${classMap({ checked: sort[0] === this._currentSort })}
                  type="button"
                  for=${sort[0]}
                  data-value=${sort[0]}
                >
                  ${sort[1]}
                </button>
              `;
            }
          )}
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-sort-by": SNSortBy;
  }
}
