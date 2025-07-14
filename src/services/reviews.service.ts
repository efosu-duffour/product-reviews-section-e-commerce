import { Product, ProductID } from "./products.service";

export type ProductReview = {
  product_id: ProductID;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
};

export type OverallReview = {
  excellent: number;
  good: number;
  average: number;
  below_average: number;
  poor: number;
  [s: string]: number;
};

export const overallRatingMapings: Record<keyof OverallReview, string> = {
  average: 'average',
  below_average: 'below average',
  excellent: 'excellent',
  good: 'good',
  poor: 'poor',
}

const SESSIONNAME = "sn-reviews";
export class ReviewsService {
  createdAt?: number;
  private _reviews?: ProductReview[];
  private _REVIEWSAPI = import.meta.env.BASE_URL + "data/product-reviews.json";

  constructor() {
    if (ReviewsService._INSTANCE) return ReviewsService._INSTANCE;
    else {
      this.createdAt = Date.now();
      ReviewsService._INSTANCE = this;
    }
  }

  async init(): Promise<ProductReview[]> {
    // Fetches the reviews from server or cache
    if (this._reviews) return this._reviews;
    let reviews: ProductReview[] = [];

    const cachedReviews = sessionStorage.getItem(SESSIONNAME);
    if (cachedReviews && cachedReviews.length !== 0) {
      reviews = JSON.parse(cachedReviews);
    } else {
      reviews = await this._fetchReviews();
      sessionStorage.setItem(SESSIONNAME, JSON.stringify(reviews));
    }

    return (this._reviews = reviews);
  }

  private async _fetchReviews(): Promise<ProductReview[]> {
    // Fetches reviews json from cache if not fetch from server, cache and store it in the local variable
    let fetchedReviews: ProductReview[] = [];
    try {
      const response = await fetch(this._REVIEWSAPI);
      const json: ProductReview[] = await response.json();
      fetchedReviews = json;
    } catch (err: unknown) {
      console.warn(err);
    }

    return fetchedReviews;
  }

  get reviews(): ProductReview[] {
    return this._reviews ?? [];
  }

  static getAverageRatingByID(
    reviews: ProductReview[],
    productID: ProductID
  ): number {
    const ratings = reviews
      .filter((review) => review.product_id === productID)
      .map((filteredReview) => filteredReview.rating || 0);

    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
    return mean;
  }

  getAverageRatingByID(productID: ProductID): number {
    return ReviewsService.getAverageRatingByID(this.reviews, productID);
  }

  static getIDsByRating(reviews: ProductReview[], rating: number): ProductID[] {
    // Get the ids that has such ratings

    const filteredIDs = reviews
      .filter(
        (review) =>
          rating ===
          Math.round(this.getAverageRatingByID(reviews, review.product_id))
      )
      .map((filteredReviews) => filteredReviews.product_id);

    return filteredIDs;
  }

  getIDsByRating(rating: number): ProductID[] {
    return ReviewsService.getIDsByRating(this.reviews, rating);
  }

  static numberOfRatings(
    reviews: ProductReview[],
    productID: ProductID
  ): number {
    return reviews.filter((review) => review.product_id === productID).length;
  }

  numberofRatings(productID: ProductID): number {
    return ReviewsService.numberOfRatings(this.reviews, productID);
  }

  static getAllReviewsByID(
    reviews: ProductReview[],
    productID: ProductID
  ): ProductReview[] {
    return reviews.filter((review) => review.product_id === productID);
  }

  getAllReviewsByID(productID: ProductID): ProductReview[] | undefined {
    return ReviewsService.getAllReviewsByID(this.reviews, productID);
  }

  static getOverallRatings(
    reviews: ProductReview[],
    productID: ProductID
  ): OverallReview | undefined {
    let overallRatings = new Array(5).fill(0);
    const filteredReviews = reviews.filter(
      (review) => review.product_id === productID
    );

    if (filteredReviews.length === 0) {
      return undefined;
    }

    filteredReviews.forEach((review) => {
      const truncRatings = review.rating;
      overallRatings[truncRatings - 1]++;
    });

    
    
    const sum = overallRatings.reduce((prev, curr) => prev + curr, 0)
    overallRatings = overallRatings.map(
      (rating) => rating / sum 
    );
    
    return {
      poor: overallRatings[0],
      below_average: overallRatings[1],
      average: overallRatings[2],
      good: overallRatings[3],
      excellent: overallRatings[4],
    }
  }

  getOverallRatings(productID: ProductID): OverallReview | undefined {
    return ReviewsService.getOverallRatings(this.reviews, productID);
  }

  private static _INSTANCE: ReviewsService | null = null;
}
