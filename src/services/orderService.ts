// lib/services/orderService.ts
import { api } from "@/lib/api";

/** ===== Base ===== */
const base = "/orders";

/** ===== Tipos (enums/DTOs) ===== */
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "ON_HOLD"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod =
  | "MERCADO_PAGO"
  | "CARD"
  | "BANK_TRANSFER"
  | "CASH"
  | "OTHER";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING"
  | "REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "EXPIRED";

/** ===== Requests ===== */
export type UpdateShippingAddressRequest = {
  shippingAddressId: number;
  recipientName?: string | null;
  phone?: string | null;
};

export type UpdateBillingProfileRequest = {
  billingProfileId: number;
};

export type UpdatePaymentMethodRequest = {
  paymentMethod: PaymentMethod;
};

export type ConfirmOrderRequest = {
  successUrl?: string | null;
  failureUrl?: string | null;
  pendingUrl?: string | null;
  callbackUrl?: string | null;
};

/** ===== Responses: LISTA (summary) ===== */
export type OrderSummary = {
  id: number;
  orderNumber: string;
  orderDate: string; // ISO
  status: OrderStatus;
  totalAmount: number | string; // según cómo serialices en el back
  itemCount?: number;
  firstItemThumb?: string | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/** ===== Responses: DETALLE ===== */
export type OrderItemResponse = {
  productId: number;
  variantId: number;
  productName: string;
  sku: string;
  attributesJson?: string | null;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  lineTotal: number;
};

export type PaymentSummaryResponse = {
  method: PaymentMethod | string;
  status: PaymentStatus | string;
  amount: number;

  // online (ej. MP/Stripe)
  redirectUrl?: string | null;
  checkoutUrl?: string | null;
  providerPaymentId?: string | null;

  // transferencia (offline)
  referenceCode?: string | null;
  bankName?: string | null;
  bankAccountHolder?: string | null;
  bankCbu?: string | null;
  bankAlias?: string | null;
  offlineNote?: string | null;
  dueAt?: string | null; // ISO

  // tiempos de transferencia (si los manejás)
  declareBy?: string | null;
  reviewDueAt?: string | null;
};

export type OrderResponse = {
  id: number;
  orderNumber: string;
  orderDate: string; // ISO
  status: OrderStatus;

  // Totales
  subTotal: number;
  shippingCost: number;
  taxAmount: number;
  discountTotal: number;
  totalAmount: number;

  // Shipping snapshot
  shippingStreet?: string | null;
  shippingStreetNumber?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingApartmentNumber?: string | null;
  shippingFloor?: string | null;
  shippingRecipientName?: string | null;
  shippingPhone?: string | null;

  // Billing snapshot
  billingFullName?: string | null;
  billingDocumentType?: "CUIT" | "CUIL" | "DNI" | "PAS" | null;
  billingDocumentNumber?: string | null;
  billingTaxCondition?:
    | "CONSUMIDOR_FINAL"
    | "MONOTRIBUTO"
    | "RESPONSABLE_INSCRIPTO"
    | "EXENTO"
    | null;
  billingBusinessName?: string | null;
  billingEmailForInvoices?: string | null;
  billingPhone?: string | null;
  billingStreet?: string | null;
  billingStreetNumber?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostalCode?: string | null;
  billingCountry?: string | null;
  billingApartmentNumber?: string | null;
  billingFloor?: string | null;

  chosenPaymentMethod?: PaymentMethod | string | null;
  payment?: PaymentSummaryResponse | null;

  items: OrderItemResponse[];
};

/** ===== Params ===== */
export type ListOrderParams = {
  page?: number; // 0-based
  size?: number;
  sort?: string; // ej: "orderDate,desc"
};

/** ===== Métodos ===== */
export const orderService = {
  /** === LISTA resumida paginada === */
  listSummaries(params: ListOrderParams = {}) {
    return api.get<PageResponse<OrderSummary>>(`${base}/summary`, { params });
  },

  /** === DETALLE === */
  getOne(id: number) {
    return api.get<OrderResponse>(`${base}/${id}`);
  },


  /** === DETALLE por NÚMERO === */
  getOneByNumber(orderNumber: string) {
    return api.get<OrderResponse>(`${base}/by-number/${encodeURIComponent(orderNumber)}`);
  },


  /** === Crear orden desde el carrito del usuario (SIN body) === */
  create() {
    return api.post<OrderResponse>(`${base}`);
  },

  /** === Listar mis órdenes (detalle completo) — legacy/compat === */
  listMine() {
    return api.get<OrderResponse[]>(`${base}`);
  },

  /** === Setear/actualizar shipping === */
  patchShippingAddress(id: number, payload: UpdateShippingAddressRequest) {
    return api.patch<OrderResponse>(`${base}/${id}/shipping-address`, payload);
  },

  /** === Setear/actualizar billing === */
  patchBillingProfile(id: number, payload: UpdateBillingProfileRequest) {
    return api.patch<OrderResponse>(`${base}/${id}/billing-profile`, payload);
  },

  /** === Elegir método de pago === */
  patchPaymentMethod(id: number, payload: UpdatePaymentMethodRequest) {
    return api.patch<OrderResponse>(`${base}/${id}/payment-method`, payload);
  },

  /** === Confirmar orden (crea Payment y congela edición) === */
  confirm(id: number, payload?: ConfirmOrderRequest) {
    return api.post<OrderResponse>(`${base}/${id}/confirm`, payload ?? {});
  },
};
