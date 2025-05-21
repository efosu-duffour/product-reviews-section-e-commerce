import { css, html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { range } from "../../../utils/range";
import { classMap } from "lit/directives/class-map.js";
import arrowLeftDoubleImage from '/arrow-left-double-line.svg';
import arrowRightDoubleImage from '/arrow-right-double-line.svg';

const forwardImage = `url("${arrowRightDoubleImage}")`;
const backwardImage = `url("${arrowLeftDoubleImage}")`;

@customElement("sn-pagination")
export class SNPagination extends LitElement {
  static styles = [
    css`
      :host {
        font-family: inherit;
        font-size: inherit;
        color: #535353;
        align-items: center;
        display: grid;
        justify-content: center;
      }
      nav {
        display: flex;
        align-items: center;
        column-gap: 15px;
        width: fit-content;
      }

      svg {
        width: 20px;
      }

      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        line-height: 0;
      }

      button {
        display: flex;
        align-items: center;
        padding: 5px;

        user-select: none;

        background-color: white;

        border: none;
        color: inherit;
        font-weight: 500;

        outline: 2px solid transparent;
        outline-offset: 0px;

        cursor: pointer;
        border-radius: 0.4em;

        font-family: inherit;
        font-size: clamp(0.7rem, 4vw, 0.9rem);

        @media (prefers-reduced-motion: no-preference) {
          transition: all 200ms ease-in-out;
        }

        &:hover {
          color: black;
          background-color: #e4e4e4;
        }

        &:active {
          background-color: #cacaca;
        }

        &:focus-visible {
          outline-offset: 2px;
          outline-color: black;
        }

        &:disabled {
          background-color: white;
          color: #b3b3b3;
          cursor: not-allowed;
          pointer-events: none;
        }
      }

      .page-numbers-container {
        display: flex;
        --page-numbers-gap: 10px;
        column-gap: var(--page-numbers-gap);
      }

      .page-nav {
        column-gap: 5px;
      }

      .page-number {
        width: 30px;
        height: 30px;
        display: none;

        border-radius: 0.4em;
      }

      .first {
        display: initial;
      }

      .last {
        display: initial;
      }

      .sibling {
        display: initial;
      }

      .active {
        display: initial;
        color: black;
        background-color: white !important;
        box-shadow: 0px 2px 2px #00000037;
      }

      .movers {
        display: initial;
        position: relative;

        span {
          opacity: 1;
          will-change: opacity;
          @media (prefers-reduced-motion: no-preference) {
            transition: opacity 200ms ease-in-out;
          }
        }
       


        &::before {
          content: "";
          position: absolute;
          inset: 0;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 20px;

          pointer-events: none;
          opacity: 0;
          will-change: opacity;

          @media (prefers-reduced-motion: no-preference) {
            transition: opacity 200ms ease-in-out;
          }
        }

        &:hover, &:focus-visible {
          span {
            opacity:0;
          }

          &::before {
            opacity: 1;
          }
        }
      }

      .forward::before {
        background-image: ${unsafeCSS(forwardImage)}
      }

      .backward::before {
        background-image: ${unsafeCSS(backwardImage)}
      }

    `,
  ];

  @property({ type: Number })
  totalNumber = 100;

  @property({ type: Number })
  numberOnEachPage = 10;

  @property({type: Number})
  currentPageNumber = 1;

  @property({ type: Boolean })
  iconOnly = false;

  @property({ type: Number })
  numberOfSiblings = 1;

  get numberOfPages(): number {
    return Math.ceil(this.totalNumber / this.numberOnEachPage);
  }

  get firstPageNumber(): number {
    return 1;
  }

  get lastPageNumber(): number {
    return this.numberOfPages;
  }

  private _isLastPage(page: number): boolean {
    return page === this.lastPageNumber;
  }

  private _isFirstPage(page: number): boolean {
    return page === this.firstPageNumber;
  }

  private _isCurrentPage(page: number): boolean {
    return page === this.currentPageNumber;
  }

  private _isSiblingPage(page: number): boolean {
    if (
      this._isCurrentPage(page) ||
      this._isFirstPage(page) ||
      this._isLastPage(page)
    )
      return false;

    // It checks if the page number is within the range of siblings region.
    const siblingRegion = Math.abs(page - this.currentPageNumber);
    return siblingRegion >= 0 && siblingRegion <= this.numberOfSiblings;
  }

  private _isLeftMostSiblingPage(page: number): boolean {
    return (
      this._isSiblingPage(page) &&
      !this._isFirstPage(page - 1) &&
      page - this.currentPageNumber === -this.numberOfSiblings
    );
  }

  private _isRightMostSiblingPage(page: number): boolean {
    return (
      this._isSiblingPage(page) &&
      !this._isLastPage(page + 1) &&
      page - this.currentPageNumber === this.numberOfSiblings
    );
  }

  private _moveToNextPage = (): void => {
    this.currentPageNumber = this._movePage(1);
    this._dispatchPageChangedEvent(this.currentPageNumber);
  };

  private _moveToPreviousPage = (): void => {
    this.currentPageNumber = this._movePage(-1);
    this._dispatchPageChangedEvent(this.currentPageNumber);
  };

  private _movePage(offset: number): number {
    const newPageNumber = this.currentPageNumber + offset;
    if (newPageNumber < this.firstPageNumber) return this.firstPageNumber;

    if (newPageNumber > this.lastPageNumber) return this.lastPageNumber;

    return newPageNumber;
  }

  private _forwardPage = (): void => {
    const midOffset = Math.trunc(
      (this.lastPageNumber - this.currentPageNumber) / 2
    );
    this.currentPageNumber = this._movePage(midOffset);
    this._dispatchPageChangedEvent(this.currentPageNumber);
  };

  private _backwardPage = (): void => {
    const midOffset = Math.trunc(
      (this.firstPageNumber - this.currentPageNumber) / 2
    );
    this.currentPageNumber = this._movePage(midOffset);
    this._dispatchPageChangedEvent(this.currentPageNumber);
  };

  private _selectPage = (page: number): void => {
    this.currentPageNumber = page;
    this._dispatchPageChangedEvent(this.currentPageNumber);
  };

  private _dispatchPageChangedEvent(currentPage: number): void {
    const event = new CustomEvent("page-change", {
      bubbles: true,
      composed: true,
      detail: { page: currentPage },
    });
    this.dispatchEvent(event);
  }

  private _renderedButton(page: number) {
    if (this._isLeftMostSiblingPage(page)) {
      return html`
        <button
          @click=${this._backwardPage}
          class="page-number movers backward"
          type="button"
          aria-label="Move page fast backward"
        >
          <span>...</span>
        </button>
        ${this._button(page)}
      `;
    } else if (this._isRightMostSiblingPage(page)) {
      return html`
        ${this._button(page)}
        <button
          @click=${this._forwardPage}
          class="page-number movers forward"
          type="button"
          aria-label="Move page fast forward"
        >
          <span>...</span>
        </button>
      `;
    } else {
      return html`${this._button(page)}`;
    }
  }

  private _button(page: number) {
    return html`
      <button
        type="button"
        class=${classMap({
          "page-number": true,
          active: this._isCurrentPage(page),
          first: this._isFirstPage(page),
          last: this._isLastPage(page),
          sibling: this._isSiblingPage(page),
        })}
        @click=${() => {
          this._selectPage(page);
        }}
        aria-label=${`Go to Page ${page}`}
        aria-current=${this._isCurrentPage(page) ? "page" : false}
      >
        <span aria-hidden="true">${page}</span>
      </button>
    `;
  }

 
  protected render() {
    return html`
      <nav aria-label="Pagination Navigation">
        <button
          class="page-nav"
          ?disabled=${this._isFirstPage(this.currentPageNumber)}
          type="button"
          aria-label="Previous page"
          @click=${this._moveToPreviousPage}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"
            ></path>
          </svg>
          <span aria-hidden="true" ?hidden=${this.iconOnly}>Previous</span>
        </button>
        <div class="page-numbers-container">
          ${range(this.firstPageNumber, this.lastPageNumber + 1).map(
            (pageNumber) => {
              return this._renderedButton(pageNumber);
            }
          )}
        </div>
        <button
          class="page-nav"
          ?disabled=${this._isLastPage(this.currentPageNumber)}
          type="button"
          aria-label="Next Page"
          @click=${this._moveToNextPage}
        >
          <span aria-hidden="true" ?hidden=${this.iconOnly}>Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"
            ></path>
          </svg>
        </button>
      </nav>
    `;
  }
}
