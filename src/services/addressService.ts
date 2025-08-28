// lib/services/addressService.ts
import { api } from "@/lib/api";

const base = "/b/addresses"; // solo admin (authed)

/** ===== Tipos ===== */
export type AddressType = "SHIPPING" | "BILLING";

export type AddressRequest = {
  street: string;
  streetNumber?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  type: AddressType;
  apartmentNumber?: string | null;
  floor?: string | null;
};

export type AddressResponse = {
  id: number;
  street: string;
  streetNumber?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  type: AddressType;
  apartmentNumber?: string | null;
  floor?: string | null;
  lastUsedAt?: string | null; // ISO
};

/** ===== Métodos ===== */
export const addressService = {
  list(type?: AddressType) {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return api.get<AddressResponse[]>(`${base}${qs}`);
  },
  getOne(id: number) {
    return api.get<AddressResponse>(`${base}/${id}`);
  },
  create(payload: AddressRequest) {
    return api.post<AddressResponse>(base, payload);
  },
  update(id: number, payload: AddressRequest) {
    return api.put<AddressResponse>(`${base}/${id}`, payload);
  },
  remove(id: number) {
    return api.del<void>(`${base}/${id}`);
  },
  touchUse(id: number) {
    return api.post<AddressResponse>(`${base}/${id}/use`, {});
  },
};
