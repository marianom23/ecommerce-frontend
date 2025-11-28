"use client";
import React, { useEffect } from "react";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orderService } from "@/services/orderService";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import toast from "react-hot-toast";
import SingleItem from "./SingleItem";
import EmptyCart from "./EmptyCart";
import { useAuth } from "@/hooks/useAuth";

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const router = useRouter();
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);

  const { isAuthenticated, loading } = useAuth();

  const handlePayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isAuthenticated) {
      toast("Debes iniciar sesión para proceder al pago", {
        icon: "🔒",
        duration: 4000,
      });
      return;
    }

    if (cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    try {
      setIsCreatingOrder(true);
      const res = await orderService.create();
      if (res && res.id) {
        closeCartModal();
        router.push(`/checkout?orderId=${res.id}`);
      } else {
        throw new Error("No se pudo crear la orden");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error al crear la orden");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  useEffect(() => {
    // cerrar al click fuera
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeCartModal();
      }
    }
    if (isCartModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div className={`fixed top-0 left-0 z-99999 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 ease-linear duration-300 ${isCartModalOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-end">
        <div className="w-full max-w-[500px] shadow-1 bg-white px-4 sm:px-7.5 lg:px-11 relative modal-content">
          <div className="sticky top-0 bg-white flex items-center justify-between pb-7 pt-4 sm:pt-7.5 lg:pt-11 border-b border-gray-3 mb-7.5">
            <h2 className="font-medium text-dark text-lg sm:text-2xl">Carrito</h2>
            <button onClick={closeCartModal} aria-label="button for close modal" className="flex items-center justify-center ease-in duration-150 bg-meta text-dark-5 hover:text-dark">
              {/* (icon close) */}
              <svg className="fill-current" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5379 11.2121C12.1718 10.846 11.5782 10.846 11.212 11.2121C10.8459 11.5782 10.8459 12.1718 11.212 12.5379L13.6741 15L11.2121 17.4621C10.846 17.8282 10.846 18.4218 11.2121 18.7879C11.5782 19.154 12.1718 19.154 12.5379 18.7879L15 16.3258L17.462 18.7879C17.8281 19.154 18.4217 19.154 18.7878 18.7879C19.154 18.4218 19.154 17.8282 18.7878 17.462L16.3258 15L18.7879 12.5379C19.154 12.1718 19.154 11.5782 18.7879 11.2121C18.4218 10.846 17.8282 10.846 17.462 11.2121L15 13.6742L12.5379 11.2121Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M15 1.5625C7.57867 1.5625 1.5625 7.57867 1.5625 15C1.5625 22.4213 7.57867 28.4375 15 28.4375C22.4213 28.4375 28.4375 22.4213 28.4375 15C28.4375 7.57867 22.4213 1.5625 15 1.5625ZM3.4375 15C3.4375 8.61421 8.61421 3.4375 15 3.4375C21.3858 3.4375 26.5625 8.61421 26.5625 15C26.5625 21.3858 21.3858 26.5625 15 26.5625C8.61421 26.5625 3.4375 21.3858 3.4375 15Z" />
              </svg>
            </button>
          </div>

          <div className="h-[66vh] overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-6">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <SingleItem key={item.id} item={item} />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 mt-7.5 sticky bottom-0">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-dark">Total Productos:</p>
              <p className="font-medium text-xl text-dark">{formatter.format(totalPrice)}</p>
            </div>

            <div className="flex items-center gap-4">
              <Link onClick={closeCartModal} href="/cart" className="w-full flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-blue-dark">
                Ver Carrito
              </Link>
              <button
                onClick={handlePayClick}
                disabled={isCreatingOrder || cartItems.length === 0}
                className={`w-full flex justify-center font-medium py-[13px] px-6 rounded-md ease-out duration-200 ${!isAuthenticated
                    ? "text-gray-600 bg-gray-400 cursor-not-allowed border-2 border-gray-300"
                    : "text-white bg-dark hover:bg-opacity-95"
                  } disabled:opacity-70`}
              >
                {isCreatingOrder ? "Procesando..." : "Pagar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
