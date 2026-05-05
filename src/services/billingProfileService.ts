// lib/services/billingProfileService.ts
import { api } from "@/lib/api";

const base = "/billing-profiles";

/** ===== Tipos ===== */
export type DocumentType = "CUIT" | "CUIL" | "DNI" | "PAS";
export type TaxCondition =
  | "CONSUMIDOR_FINAL"
  | "MONOTRIBUTO"
  | "RESPONSABLE_INSCRIPTO"
  | "EXENTO";

export type BillingProfileRequest = {
  documentType?: DocumentType | null;
  documentNumber?: string | null;
  fullName?: string;
  taxCondition: TaxCondition;
  businessName?: string | null;
  emailForInvoices?: string | null;
  phone?: string | null;

  street?: string;
  streetNumber?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  apartmentNumber?: string;
  floor?: string;

  isDefault?: boolean | null;
};

export type BillingProfileResponse = {
  id: number;

  documentType?: DocumentType | null;
  documentNumber?: string | null;
  fullName?: string;
  taxCondition: TaxCondition;
  businessName?: string | null;
  emailForInvoices?: string | null;
  phone?: string | null;

  street?: string;
  streetNumber?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  apartmentNumber?: string;
  floor?: string;

  defaultProfile: boolean; // expuesto así desde el backend
};

/** ===== Métodos ===== */
export const billingProfileService = {
  listMine() {
    return api.get<BillingProfileResponse[]>(`${base}`);
  },
  getOne(id: number) {
    return api.get<BillingProfileResponse>(`${base}/${id}`);
  },
  create(payload: BillingProfileRequest) {
    return api.post<BillingProfileResponse>(base, payload);
  },
  update(id: number, payload: BillingProfileRequest) {
    return api.put<BillingProfileResponse>(`${base}/${id}`, payload);
  },
  remove(id: number) {
    return api.del<void>(`${base}/${id}`);
  },
  setDefault(id: number) {
    return api.post<BillingProfileResponse>(`${base}/${id}/default`, {});
  },
};
