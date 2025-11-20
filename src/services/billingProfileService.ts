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
  documentType: DocumentType;
  documentNumber: string;
  fullName?: string; 
  taxCondition: TaxCondition;
  businessName?: string | null;
  emailForInvoices?: string | null;
  phone?: string | null;

  billingAddressId: number;
  isDefault?: boolean | null;
};

export type BillingProfileResponse = {
  id: number;

  documentType: DocumentType;
  documentNumber: string;
  fullName?: string; 
  taxCondition: TaxCondition;
  businessName?: string | null;
  emailForInvoices?: string | null;
  phone?: string | null;

  billingAddressId: number;
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
