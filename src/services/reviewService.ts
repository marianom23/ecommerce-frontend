import { api } from "@/lib/api";
import { ReviewRequest, ReviewResponse } from "@/types/review";

const BASE_URL = "/reviews";

export const reviewService = {
    // Obtener todas las reviews de un producto
    async getReviewsByProduct(productId: number): Promise<ReviewResponse[]> {
        const reviews = await api.get<ReviewResponse[]>(
            `${BASE_URL}/product/${productId}`
        );
        return reviews || [];
    },

    // Obtener la review del usuario actual para un producto
    async getMyReviewForProduct(productId: number): Promise<ReviewResponse | null> {
        try {
            const review = await api.get<ReviewResponse>(
                `${BASE_URL}/me/product/${productId}`
            );
            return review || null;
        } catch (error: any) {
            // Si no existe review (404), retornar null
            if (error?.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Obtener todas mis reviews
    async getMyReviews(): Promise<ReviewResponse[]> {
        const reviews = await api.get<ReviewResponse[]>(`${BASE_URL}/me`);
        return reviews || [];
    },

    // Crear una nueva review
    async createReview(request: ReviewRequest): Promise<ReviewResponse> {
        const review = await api.post<ReviewResponse>(BASE_URL, request);
        return review;
    },

    // Actualizar una review existente
    async updateReview(reviewId: number, request: ReviewRequest): Promise<ReviewResponse> {
        const review = await api.put<ReviewResponse>(
            `${BASE_URL}/${reviewId}`,
            request
        );
        return review;
    },

    // Eliminar una review
    async deleteReview(reviewId: number): Promise<void> {
        await api.del(`${BASE_URL}/${reviewId}`);
    },
};
