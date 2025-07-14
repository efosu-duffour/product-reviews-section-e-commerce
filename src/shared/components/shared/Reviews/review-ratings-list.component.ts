import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, query, state, } from "lit/decorators.js";
import { ReviewUserProp } from "./review-user.component";
import "./review-user.component";

@customElement("sn-user-review-list")
export class SNUserReviewList extends LitElement {
  static styles = [
    css`
    button {
      margin-block-start: 32px;
      width: 100%;
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

    [review-list-container] {
      display: grid;
      gap: 32px;
    }

    :host:has(.empty-container) {
      display: grid;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .empty-container {

      .smiley {
        background-color: white;
        width: 45px;
        aspect-ratio: 1 / 1;
        border-radius: 1000px;
        
        margin-inline: auto;

        display: flex;
        align-items: center;
        justify-content: center;

        box-shadow: 0px 2px 4px #a8a8a8c5;
      }
   
      p {
        font-weight: bolder;
        text-align: center;
      }

      span{
        display: block;
        margin-block-start: 1em;
        font-weight: initial;
      }
    }
    `
  ]
  @property({ type: Array, attribute: false })
  reviews!: ReviewUserProp[];

  @state()
  private _reviewsLeft!: number;

  @query("[review-list-container]")
  private _reviewListContainer!: HTMLDivElement;

  connectedCallback(): void {
    super.connectedCallback();
    const reviewsLeft = this.reviews.length - this._maximumReviewLoad;
    this._reviewsLeft = reviewsLeft <= 0 ? 0 : reviewsLeft;
  }

  private _maximumReviewLoad = 12;

  private _sliceIndex = 1;


  private _loadMoreReviews = () => {
    let newReviews = [];
    if (!this._reviewListContainer) return;
    if (this._reviewsLeft > this._maximumReviewLoad) {
      newReviews = this.reviews.slice(
        this._sliceIndex * this._maximumReviewLoad,
      (this._sliceIndex + 1) * this._maximumReviewLoad
      );
      this._reviewsLeft = this._reviewsLeft - this._maximumReviewLoad;
    } else {
      const start = this._sliceIndex * this._maximumReviewLoad;
      newReviews = this.reviews.slice(start, start + this._reviewsLeft);
      this._reviewsLeft = 0;
    }

    const newReviewComponents = newReviews.map((review) => {
      const reviewUserComponent = document.createElement("sn-user-review");
      reviewUserComponent.review = review;
      return reviewUserComponent;
    });

    newReviewComponents.forEach((reviewComponent) =>
      this._reviewListContainer.appendChild(reviewComponent)
    );

    this._sliceIndex++;
  };

  private _getReviewLeft() {
    return this._reviewsLeft >= this._maximumReviewLoad
      ? this._maximumReviewLoad
      : this._reviewsLeft;
  }

  private _userReviewList() {
    return html`
      <div class="reviews">
        <div review-list-container>
          ${this.reviews
            .slice(0, this._maximumReviewLoad)
            .map(
              (review) =>
                html`<sn-user-review .review=${review}></sn-user-review>`
            )}
        </div>
        <button
          ?hidden=${this._reviewsLeft === 0}
          type="button"
          @click=${this._loadMoreReviews}
        >
          Show ${this._getReviewLeft()} more reviews
        </button>
      </div>
    `;
  }

  private _emptyUserReview() {
    return html`
      <div class="empty-container">
        <div class="smiley">
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="darkblue"><path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22H2L4.92893 19.0711C3.11929 17.2614 2 14.7614 2 12ZM6.82843 20H12C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.1524 4.85124 16.1649 6.34315 17.6569L7.75736 19.0711L6.82843 20ZM8 13H16C16 15.2091 14.2091 17 12 17C9.79086 17 8 15.2091 8 13Z"></path></svg>
        </div>
        <p>No review yet!<span>Be the first to review this product</span></p>
      </div>
    `;
  }

  protected render() {
    return html`
      ${this.reviews.length === 0
        ? this._emptyUserReview()
        : this._userReviewList()}
    `;
  }
}
