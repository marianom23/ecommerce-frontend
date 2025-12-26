// services/paymentService.ts
import { api } from "@/lib/api";
import type { OrderResponse } from "./orderService";

const base = "/payments";

export type ConfirmBankTransferRequest = {
    reference?: string;
    receiptUrl?: string;
};

export const paymentService = {
    /**
     * Confirma una transferencia bancaria por parte del usuario.
     * Cambia el estado del pago de INITIATED a REVIEW (pendiente de verificación del admin).
     * @param orderId - ID de la orden
     * @param payload - (Opcional) Datos adicionales como referencia y URL del comprobante
     */
    confirmBankTransfer(orderId: number, payload?: ConfirmBankTransferRequest) {
        return api.post<OrderResponse>(`${base}/orders/${orderId}/bank-transfer/confirm`, payload ?? {});
    },
};
