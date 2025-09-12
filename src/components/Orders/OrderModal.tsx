// components/account/orders/OrderModal.tsx
import React from "react";
import OrderDetails from "./OrderDetails";
import EditOrder from "./EditOrder";
import type { OrderResponse } from "@/services/orderService";

type Props = {
  showDetails: boolean;
  showEdit: boolean;
  toggleModal: (status: boolean) => void;
  order: OrderResponse | null;  // detalle cuando esté cargado
  orderId: number;              // para mostrar algo mientras carga
  loading?: boolean;
};

const OrderModal = ({ showDetails, showEdit, toggleModal, order, orderId, loading }: Props) => {
  if (!showDetails && !showEdit) return null;

  return (
    <div className="backdrop-filter-sm fixed left-0 top-0 z-[99999] flex min-h-screen w-full justify-center items-center bg-[#000]/40 px-4 py-8 sm:px-8">
      <div className="shadow-7 relative w-full max-w-[600px] min-h-[242px] rounded-[15px] bg-white transition-all flex flex-col">
        <button
          onClick={() => toggleModal(false)}
          className="text-body absolute -right-6 -top-6 z-[9999] flex h-11.5 w-11.5 items-center justify-center rounded-full border-2 border-stroke bg-white hover:text-dark"
          aria-label="Close"
        >
          ✕
        </button>

        {showDetails && (
          loading ? (
            <div className="p-8">Cargando detalle de orden #{String(orderId).slice(-8)}…</div>
          ) : order ? (
            <OrderDetails orderItem={order} />
          ) : (
            <div className="p-8 text-red">No se pudo cargar el detalle.</div>
          )
        )}

        {showEdit && order && <EditOrder order={order} toggleModal={toggleModal} />}
      </div>
    </div>
  );
};

export default OrderModal;
