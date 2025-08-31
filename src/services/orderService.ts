// lib/services/orderService.ts
import { api } from "@/lib/api";

/** ===== Base ===== */
const base = "/b/orders";

/** ===== Tipos (enums/DTOs) ===== */
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED";
export type PaymentMethod = "MERCADO_PAGO" | "CARD" | "TRANSFER" | "CASH" | "OTHER";
export type PaymentStatus = "INITIATED" | "PENDING" | "REVIEW" | "APPROVED" | "REJECTED" | "CANCELED" | "EXPIRED";

/** Requests */
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

/** Responses */
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
  providerPaymentId?: string | null;

  // transferencia (offline)
  referenceCode?: string | null;
  bankName?: string | null;
  bankAccountHolder?: string | null;
  bankCbu?: string | null;
  bankAlias?: string | null;
  offlineNote?: string | null;
  dueAt?: string | null; // ISO

  // tiempos de transferencia (si los tenés en el backend)
  declareBy?: string | null;    // límite 30'
  reviewDueAt?: string | null;  // ventana 48h
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
  billingDocumentType?: "CUIT" | "CUIL" | "DNI" | "PAS" | null;
  billingDocumentNumber?: string | null;
  billingTaxCondition?: "CONSUMIDOR_FINAL" | "MONOTRIBUTO" | "RESPONSABLE_INSCRIPTO" | "EXENTO" | null;
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

/** ===== Métodos ===== */
export const orderService = {
  /** Crear orden desde el carrito del usuario (SIN body) */
  create() {
    return api.post<OrderResponse>(`${base}`);
  },

  /** Obtener una orden propia */
  getOne(id: number) {
    return api.get<OrderResponse>(`${base}/${id}`);
  },

  /** Listar mis órdenes */
  listMine() {
    return api.get<OrderResponse[]>(`${base}`);
  },

  /** Setear/actualizar shipping */
  patchShippingAddress(id: number, payload: UpdateShippingAddressRequest) {
    return api.patch<OrderResponse>(`${base}/${id}/shipping-address`, payload);
  },

  /** Setear/actualizar billing */
  patchBillingProfile(id: number, payload: UpdateBillingProfileRequest) {
    return api.patch<OrderResponse>(`${base}/${id}/billing-profile`, payload);
  },

  /** Elegir método de pago */
  patchPaymentMethod(id: number, payload: UpdatePaymentMethodRequest) {
    return api.patch<OrderResponse>(`${base}/${id}/payment-method`, payload);
  },

  /** Confirmar orden (crea Payment y congela edición) */
  confirm(id: number, payload?: ConfirmOrderRequest) {
    return api.post<OrderResponse>(`${base}/${id}/confirm`, payload ?? {});
  },
};
