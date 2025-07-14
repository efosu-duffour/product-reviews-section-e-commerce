import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  overallRatingMapings,
  OverallReview,
} from "../../../../services/reviews.service";
import { ReviewUserProp } from "./review-user.component";
import "./review-ratings-list.component";
import "./ratings-dashboard.component";
import "../Ratings/ratings-read-only.component";

export type ReviewProps = {
  user_reviews: ReviewUserProp[];
  overall_ratings: OverallReview | undefined;
  average_ratings: number;
  reviews: number;
};

@customElement("sn-review-section")
export class SNReviewSection extends LitElement {
  static styles = [
    css`
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      :host {
        container-type: inline-size;
        container-name: container;
        display: block;
        background-color: white;
        border-radius: 0.75em;
        padding: clamp(20px, 5%, 2rem);
      }
      

      .container {
        display: grid;
        grid-template-columns: minmax(400px, max-content) 1fr;
        gap: 52px;
      }

      .dashboard {

        h1 {
          font-size: x-large;
          margin-block-end: 0.25em;
        }

        button {
        margin-block-start: 32px;
        display: block;
        margin-inline: auto;
        border: none;
        padding: 0.75em;
        font-weight: bold;
        border-radius: 5px;
        background-color: white;
        box-shadow: 0px 1px 3px 1px #5f5f5f29;
        cursor: pointer;

        transition: all 200ms ease-in-out;
        will-change: background-color;


        &:hover {
          background-color: #f0f0f0;
        }
      }
      }

      .ratings-container {
        margin-block-end: 3em;
       p {
         display: flex;
         align-items: center;
         gap: 1em;
       }

       sn-ratings-read-only {
        margin-block-end: 3px;
       }
      }

      .controls {
        margin-block-end: 15px;
        button {
          background-color: transparent;
          display: block;
          margin-inline-start: auto;
          border: none;
          svg {
           fill: black;
         }

        }
      }

      @container container (max-width: 850px) {
        .container {
          grid-template-columns: 1fr;
        }

        .reviews {
          font-size: small;
        }
      }
    `,
  ];
  @property({ type: Object, attribute: false })
  reviewsProps!: ReviewProps;

  private _convert(overAllRating: OverallReview | undefined) {
    if (!overAllRating)
      return undefined;
    for (let key in overAllRating) {
      overAllRating[key] = Math.round(overAllRating[key] * 100);
    }

    return overAllRating;
  }

  protected render() {
    return html`
    <div class="controls">
      <button type="button" aria-label="close reviews">
        <svg width=30 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
      </button>
    </div>
      <div class="container">
        <div class="dashboard">
          <h1>Overall Rating</h1>
          <div class="ratings-container">
            <p>
              <span class="rating">${this.reviewsProps.average_ratings.toFixed(1)}</span>
              <sn-ratings-read-only
                .ratings=${this.reviewsProps.average_ratings}
              ></sn-ratings-read-only>
              <span class="reviews" ?hidden=${this.reviewsProps.reviews === 0}
                >Based on ${this.reviewsProps.reviews} reviews</span
              >
            </p>
          </div>
          <div class="rating-dashboard">
            <sn-rating-dashboard
              .overallRatings=${this._convert(
                this.reviewsProps.overall_ratings
              )}
            ></sn-rating-dashboard>
          </div>
          <button type="button">Write a review</button>
        </div>
        <div class="list">
          <sn-user-review-list
            .reviews=${this.reviewsProps.user_reviews}
          ></sn-user-review-list>
        </div>
      </div>
    `;
  }
}
