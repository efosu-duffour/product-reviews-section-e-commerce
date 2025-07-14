import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ProductReview } from "../../../../services/reviews.service";
import { User } from "../../../../services/users.service";
import "../Galleries/image.component";
import "../Ratings/ratings-read-only.component";

export type ReviewUserProp = Omit<ProductReview, "product_id"> & User;

@customElement("sn-user-review")
export class SNUserReview extends LitElement {
  @property({ type: Object, attribute: false })
  review!: ReviewUserProp;
  private _default_avatar = "avatar-default.svg";

  static styles = [
    css`

    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
    .user-content {
      margin-block-start: 16px;
    }

    .user-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      sn-img {
    
        width: 50px;
        aspect-ratio: 1;
        border-radius: 1000px;
        overflow: clip;
      }

    }

    .ratings-container {
      display: flex;
      flex-direction: column;
      align-self: stretch;
      justify-content: space-between;
    }

    .name {
      font-size: medium;
      font-weight: bold;
    }

    p {
      color: #353535;
      font-size: medium;
      line-height: 1.5;
    }

    .date {
      color: #353535;
      font-size: small;
      margin-inline-start: auto;
    }
    `
  ]

  protected render() {
    return html`
      <div class="container">
        <div class="user-info">
          <sn-img placeholder="">
            <img
              style="object-fit: cover; object-position: center; border-radius: 1000px;"
              width="200"
              height="200"
              src=${this.review.avatar_url ?? this._default_avatar}
              alt=${this.review.avatar_url
                ? `avatar of ${this.review.name}`
                : `${this.review.name}'s mascot avatar`}
            />
          </sn-img>
          <div class="ratings-container">
            <span class="name">${this.review.name}</span>
            <sn-ratings-read-only
              ratings=${this.review.rating}
            ></sn-ratings-read-only>
          </div>
          <span class="date">${this.review.created_at}</span>
        </div>
        <div class="user-content">
          <p>${this.review.content}</p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sn-user-review": SNUserReview;
  }
}
