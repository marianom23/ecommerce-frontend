import React from "react";
import Image from "next/image";

interface StarRatingProps {
    rating: number | null;
    totalReviews?: number;
    showReviewCount?: boolean;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    totalReviews,
    showReviewCount = true,
    size = 15,
}) => {
    const normalizedRating = rating ?? 0;

    const stars = Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        let opacity = 1;

        if (normalizedRating >= starValue) {
            opacity = 1;
        } else if (normalizedRating > starValue - 1 && normalizedRating < starValue) {
            const fraction = normalizedRating - (starValue - 1);
            opacity = fraction;
        } else {
            opacity = 0.2;
        }

        return (
            <div key={index} style={{ opacity }}>
                <Image
                    src="/images/icons/icon-star.svg"
                    alt="star"
                    width={size}
                    height={size}
                />
            </div>
        );
    });

    return (
        <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center gap-1">{stars}</div>
            {showReviewCount && totalReviews !== undefined && (
                <p className="text-custom-sm">({totalReviews})</p>
            )}
        </div>
    );
};
