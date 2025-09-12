"use client";
import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { orderService } from "@/services/orderService"; // ← el service que te pasé antes

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const OrderSummary = () => {
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleProceedToCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    try {
      setIsLoading(true);
      // Crea la orden SIN body (backend toma los items del carrito del usuario logueado)
      const res = await orderService.create();
      const order = res;
      if (!order?.id) {
        throw new Error("No se recibió el ID de la orden.");
      }
      // Redirigís al checkout pasando orderId (ahí pedís shipping, billing, payment, etc.)
      router.push(`/checkout?orderId=${order.id}`);
    } catch (err: any) {
      // Mensaje simple; si usás un toast, reemplazá por tu notificación
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

          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                {formatter.format(totalPrice)}
              </p>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={isLoading || cartItems.length === 0}
            className="w-full mt-7.5 inline-flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando orden..." : "Proceder al pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
