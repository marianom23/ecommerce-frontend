export interface ReviewRequest {
    productId: number;
    rating: number; // 1-5
    comment?: string;
}

export interface ReviewResponse {
    id: number;
    productId: number;
    productName: string;
    userId: number;
    userName: string;
    rating: number;
    comment: string | null;
    reviewDate: string; // ISO date string
}
