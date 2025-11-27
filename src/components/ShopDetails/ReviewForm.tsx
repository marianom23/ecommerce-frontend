import React, { useState } from "react";
import { ReviewRequest, ReviewResponse } from "@/types/review";
import Image from "next/image";

interface ReviewFormProps {
    productId: number;
    existingReview?: ReviewResponse | null;
    onSubmit: (request: ReviewRequest) => Promise<void>;
    onCancel?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    productId,
    existingReview,
    onSubmit,
    onCancel,
}) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert("Por favor selecciona una calificación");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                productId,
                rating,
                comment: comment.trim() || undefined,
            });

            // Reset form if creating new review
            if (!existingReview) {
                setRating(0);
                setComment("");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-1 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-dark mb-4">
                {existingReview ? "Editar tu opinión" : "Escribe tu opinión"}
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Rating selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-dark mb-2">
                        Calificación *
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Image
                                    src="/images/icons/icon-star.svg"
                                    alt={`${star} star`}
                                    width={24}
                                    height={24}
                                    style={{
                                        opacity:
                                            star <= (hoveredRating || rating) ? 1 : 0.2,
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment textarea */}
                <div className="mb-4">
                    <label
                        htmlFor="review-comment"
                        className="block text-sm font-medium text-dark mb-2"
                    >
                        Comentario (opcional)
                    </label>
                    <textarea
                        id="review-comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comparte tu experiencia con este producto..."
                        className="w-full px-4 py-3 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="px-6 py-2.5 bg-blue text-white rounded-md font-medium hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? "Enviando..."
                            : existingReview
                                ? "Actualizar opinión"
                                : "Publicar opinión"}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 border border-gray-3 text-dark rounded-md font-medium hover:bg-gray-1"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
