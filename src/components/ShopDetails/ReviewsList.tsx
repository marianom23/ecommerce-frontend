import React from "react";
import { ReviewResponse } from "@/types/review";
import { ReviewItem } from "./ReviewItem";
import { StarRating } from "@/components/Common/StarRating";

interface ReviewsListProps {
    reviews: ReviewResponse[];
    averageRating: number | null;
    totalReviews: number;
    currentUserId?: number;
    onEditReview?: (review: ReviewResponse) => void;
    onDeleteReview?: (reviewId: number) => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
    reviews,
    averageRating,
    totalReviews,
    currentUserId,
    onEditReview,
    onDeleteReview,
}) => {
    return (
    
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-dark mb-6">
                Opiniones de clientes
            </h3>

            {/* Rating summary */}
            <div className="bg-gray-1 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-dark">
                            {averageRating?.toFixed(1) || "0.0"}
                        </div>
                        <div className="mt-2">
                            <StarRating rating={averageRating} showReviewCount={false} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-dark-2">
                            Basado en <strong>{totalReviews}</strong>{" "}
                            {totalReviews === 1 ? "opinión" : "opiniones"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reviews list */}
            {reviews.length > 0 ? (
                <div>
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            currentUserId={currentUserId}
                            onEdit={onEditReview}
                            onDelete={onDeleteReview}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-dark-4 py-8">
                    Aún no hay opiniones para este producto
                </p>
            )}
        </div>
    );
};
