import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("sn-ratings-read-only")
export class SNRatingsReadOnly extends LitElement {
  static styles = [
    css`
    .star-rating {
      font-size: 23px;
      color: #dadee9;
      position: relative;
      width: fit-content;
     
    } 
    .star-rating::before {
        content: "\u2605 \u2605 \u2605 \u2605 \u2605";
        display: inline-block;
        color: gold;
        position: absolute;
        inset: 0;
        width: var(--ratings-width, 0%);
        white-space: nowrap;
        overflow: hidden;
      }
    `
  ]
  @property({ type: Number })
  ratings = 4;

  private _ratingsToPercentage(ratings: number): string {
    return `${(ratings / 5) * 100}%`;
  }

  protected render(): unknown {
    return html`
      <div
        class="star-rating"
        style="--ratings-width: ${this._ratingsToPercentage(this.ratings)}"
      >&#9733; &#9733; &#9733; &#9733; &#9733;</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-ratings-read-only": SNRatingsReadOnly;
  }
}
