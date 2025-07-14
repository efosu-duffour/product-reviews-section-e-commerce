import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  overallRatingMapings,
  OverallReview,
} from "../../../../services/reviews.service";

@customElement("sn-rating-dashboard")
export class SNRatingDashboard extends LitElement {
  @property({ type: Object, attribute: false })
  overallRatings!: OverallReview | undefined;

  static styles = [
    css`
      .container {
        display: flex;
        flex-direction: column;

        gap: 16px;
        font-size: medium;

        &[no-reviews] {
          span:not(.rate) {
            color: #8a8c91;
          }
        }

        .rating {
          display: grid;
          grid-template-columns: 12ch 1fr 4ch;
          align-items: center;
          gap: 16px;
        }

        .bar {
          --thumb-width: 0;
          --thumb-color: black;
          width: 100%;
    
          min-width: 100px;
          height: 10px;
          border-radius: 1000px;
          background-color: #e6e7eb;
          position: relative;

          &::before {
            content: "";
            position: absolute;
            inset: 0;
            background-color: var(--thumb-color);
            border-radius: inherit;
            width: var(--thumb-width);
          }
        }
        span {
          text-transform: capitalize;
        }
      }
    `,
  ];

  protected render() {
    const excellent = this.overallRatings ? this.overallRatings.excellent : 0;
    const average = this.overallRatings ? this.overallRatings.average : 0;
    const poor = this.overallRatings ? this.overallRatings.poor : 0;
    const good = this.overallRatings ? this.overallRatings.good : 0;
    const below_average = this.overallRatings ? this.overallRatings.below_average : 0;
    console.log(excellent)
    return html`
      <div class="container" ?no-reviews=${!this.overallRatings}>
        <div class="rating">
          <span excellent>${overallRatingMapings.excellent}</span>
          <div
            class="bar"
            style=${`--thumb-width: ${excellent}%; --thumb-color: #17a34a;`}
          ></div>
          <span class="rate">${excellent}%</span>
        </div>
        <div class="rating">
          <span good>${overallRatingMapings.good}</span>
          <div class="bar"
          style=${`--thumb-width: ${good}%; --thumb-color: #22c45d;`}></div>
          <span class="rate">${good}%</span>
        </div>
        <div class="rating">
          <span average>${overallRatingMapings.average}</span>
          <div class="bar"
          style=${`--thumb-width: ${average}%; --thumb-color: #fde045;`}></div>
          <span class="rate">${average}%</span>
        </div>
        <div class="rating">
          <span below_average>${overallRatingMapings.below_average}</span>
          <div class="bar"
          style=${`--thumb-width: ${below_average}%; --thumb-color: #e9b308;`}></div>
          <span class="rate">${below_average}%</span>
        </div>
        <div class="rating">
          <span poor>${overallRatingMapings.poor}</span>
          <div class="bar"
          style=${`--thumb-width: ${poor}%; --thumb-color: red;`}></div>
          <span class="rate">${poor}%</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-rating-dashboard": SNRatingDashboard;
  }
}
