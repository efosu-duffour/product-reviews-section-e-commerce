import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("sn-ratings-read-only")
export class SNRatingsReadOnly extends LitElement {
  static styles = [
    css`
      .blue-stars,
      .star-rating {
        font-size: 23px;
        
        background-repeat: no-repeat;
        background-clip: text;
        color: transparent;
        white-space: nowrap;
        line-height: auto;
      }

      .star-rating {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(45deg, gold);
        width: var(--ratings-width, 0%);
      }

      .blue-stars {
        position: relative;
        background-image: linear-gradient(45deg, #dadee9);
        background-size: 100%;
        width: fit-content;
  
      }
    `,
  ];
  @property({ type: Number })
  ratings = 4;

  private _ratingsToPercentage(ratings: number): string {
    return `${(ratings / 5) * 100}%`;
  }

  protected render(): unknown {
   
    return html`
      <div class="blue-stars">
         &#9733; &#9733; &#9733; &#9733; &#9733;
        <div
          class="star-rating"
          style="--ratings-width: ${this._ratingsToPercentage(this.ratings)}"
        >
          &#9733; &#9733; &#9733; &#9733; &#9733;
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-ratings-read-only": SNRatingsReadOnly;
  }
}
