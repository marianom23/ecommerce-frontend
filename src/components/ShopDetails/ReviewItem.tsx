import React from "react";
import { ReviewResponse } from "@/types/review";
import { StarRating } from "@/components/Common/StarRating";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewItemProps {
    review: ReviewResponse;
    currentUserId?: number;
    onEdit?: (review: ReviewResponse) => void;
    onDelete?: (reviewId: number) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
    review,
    currentUserId,
    onEdit,
    onDelete,
}) => {
    const isOwner = currentUserId === review.userId;
    const reviewDate = new Date(review.reviewDate);
    const timeAgo = formatDistanceToNow(reviewDate, {
        addSuffix: true,
        locale: es,
    });

    return (
        <div className="border-b border-gray-3 pb-6 mb-6 last:border-0">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-dark">{review.userName}</h4>
                    <p className="text-sm text-dark-4">{timeAgo}</p>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(review)}
                                className="text-sm text-blue hover:underline"
                            >
                                Editar
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(review.id)}
                                className="text-sm text-red-500 hover:underline"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-3">
                <StarRating rating={review.rating} showReviewCount={false} size={16} />
            </div>

            {review.comment && (
                <p className="text-dark-2 leading-relaxed">{review.comment}</p>
            )}
        </div>
    );
};
