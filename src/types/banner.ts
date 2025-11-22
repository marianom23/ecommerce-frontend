export type BannerPlacement =
    | "HOME_HERO_MAIN"
    | "HOME_HERO_SIDE_TOP"
    | "HOME_HERO_SIDE_BOTTOM"
    | "HOME_PROMO_TOP"
    | "HOME_PROMO_BOTTOM_LEFT"
    | "HOME_PROMO_BOTTOM_RIGHT"
    | "HOME_COUNTDOWN";

export interface Banner {
    id: number;
    placement: BannerPlacement;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl: string;
    ctaText?: string;
    ctaUrl?: string;
    price?: number;
    oldPrice?: number;
    discountPercent?: number;
    countdownUntil?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CreateBannerDto = Omit<Banner, "id" | "createdAt" | "updatedAt">;
export type UpdateBannerDto = Partial<CreateBannerDto>;
