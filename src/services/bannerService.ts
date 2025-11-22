import { api } from "@/lib/api";
import { Banner, CreateBannerDto, UpdateBannerDto } from "@/types/banner";

const base = "/banners";

export const bannerService = {
    getAll(placement?: string) {
        const params = placement ? { placement } : undefined;
        return api.get<Banner[]>(base, { params });
    },

    create(data: CreateBannerDto) {
        return api.post<Banner>(base, data);
    },

    update(id: number, data: UpdateBannerDto) {
        return api.put<Banner>(`${base}/${id}`, data);
    },

    remove(id: number) {
        return api.del<void>(`${base}/${id}`);
    },
};
