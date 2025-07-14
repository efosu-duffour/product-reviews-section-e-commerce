import { provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import {
  ReviewsServiceContext,
  UserServiceContext,
} from "../../../../services/context";
import {
  ProductReview,
  ReviewsService,
} from "../../../../services/reviews.service";
import { Task } from "@lit/task";
import { User, UserService } from "../../../../services/users.service";
import "../Reviews/product-review-section.component";
import { ProductID } from "../../../../services/products.service";
import { ReviewProps } from "../Reviews/product-review-section.component";
import { ReviewUserProp } from "./review-user.component";

@customElement("sn-review-section-page")
export class SNReviewSectionPage extends LitElement {
  @provide({ context: ReviewsServiceContext })
  private _reviewService = new ReviewsService();

  @provide({ context: UserServiceContext })
  private _userService = new UserService();

  private _selectedProductID: ProductID = "voyager-hoodie";

  private _task = new Task<any, ReviewProps>(this, {
    task: async () => {
      const reviews: ProductReview[] = await this._reviewService
        .init()
        .then((reviews) =>
          ReviewsService.getAllReviewsByID(reviews, this._selectedProductID)
        );
      let users: User[] = await this._userService.init();

      const reviewUserProps: ReviewUserProp[] = reviews.map((review) => {
        const user = users.find((user) => user.user_id === review.user_id);
        return {
          ...user!,
          ...review,
        };
      });

      const average_ratings = ReviewsService.getAverageRatingByID(
        reviews,
        this._selectedProductID
      );
      const overall_ratings = ReviewsService.getOverallRatings(
        reviews,
        this._selectedProductID
      );
      return {
        user_reviews: reviewUserProps,
        average_ratings,
        overall_ratings,
        reviews: reviews.length,
      };
    },
    args: () => [],
  });

  protected render() {
    return this._task.render({
      complete(reviewProps) {
        return html`
          <sn-review-section .reviewsProps=${reviewProps}></sn-review-section>
        `;
      },
    });
  }
}
