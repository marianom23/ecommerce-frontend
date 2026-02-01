"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectCartItems, selectTotalPrice, selectCart } from "@/redux/features/cart-slice";
import { orderService } from "@/services/orderService";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const OrderSummary = () => {
  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { clear } = useCart();

  const { user, loading, isAuthenticated } = useAuth();

  const handleProceedToCheckout = async () => {
    if (loading) return;

    if (!cartItems || cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      setIsLoading(true);

      // Si no está autenticado, enviar sessionId del carrito
      const sessionId = !isAuthenticated && cart?.sessionId ? cart.sessionId : undefined;
      const res = await orderService.create(sessionId);
      const order = res;

      if (!order?.id) {
        throw new Error("No se recibió el ID de la orden.");
      }

      clear();
      router.push(`/checkout?orderNumber=${order.orderNumber}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo crear la orden. Intentá de nuevo.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Resumen de la orden</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Producto</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-5 border-b border-gray-3"
            >
              <div className="pr-4">
                <p className="text-dark">
                  {item.name}{" "}
                  <span className="text-gray-600">× {item.quantity}</span>
                </p>
              </div>
              <div>
                <p className="text-dark text-right">
                  {formatter.format(item.subtotal)}
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-5 border-b border-gray-3 pb-5">
            <p className="font-medium text-dark">Costo de Envío</p>
            <p className="text-dark">Gratis</p>
          </div>

          <div className="flex items-center justify-between pt-5 border-b border-gray-3 pb-5">
            <p className="font-medium text-dark">Descuento</p>
            <p className="text-dark">$0</p>
          </div>

          <div className="flex items-center justify-between pt-5">
            <p className="font-medium text-xl text-dark">Total</p>
            <p className="font-medium text-xl text-dark text-right">
              {formatter.format(totalPrice)}
            </p>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={isLoading || cartItems.length === 0}
            className="w-full mt-7.5 inline-flex justify-center font-medium py-3 px-6 rounded-md ease-out duration-200 text-white bg-blue hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando orden..." : "Proceder a checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
