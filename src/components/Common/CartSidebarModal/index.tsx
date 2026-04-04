"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { orderService } from "@/services/orderService";
import { useSelector } from "react-redux";
import { selectCart, selectCartItems, selectItemsCount, selectTotalPrice } from "@/redux/features/cart-slice";
import type { CartItem as StoreCartItem } from "@/types/cart";
import CloudinaryImage from "@/components/Common/CloudinaryImage";

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const formatDisplayValue = (value?: string) => {
  if (!value) return "";

  const normalized = value.trim();
  const mappedValues: Record<string, string> = {
    DIGITAL: "Digital",
    PHYSICAL: "Fisico",
    DIGITAL_ON_DEMAND: "Digital bajo demanda",
    DIGITAL_INSTANT: "Digital instantaneo",
  };

  if (mappedValues[normalized]) return mappedValues[normalized];

  return normalized
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const parseAttributes = (attributesJson?: string | null) => {
  try {
    return attributesJson ? (JSON.parse(attributesJson) as Record<string, string>) : null;
  } catch {
    return null;
  }
};

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const { isAuthenticated, loading } = useAuth();
  const { updateQuantity, removeItem, clear } = useCart();
  const router = useRouter();

  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const itemCount = useSelector(selectItemsCount);

  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    if (isCartModalOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
      return;
    }

    setIsAnimating(false);
    document.body.style.overflow = "";
    const timer = window.setTimeout(() => setShouldRender(false), 300);
    return () => window.clearTimeout(timer);
  }, [isCartModalOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCartModal();
    };

    if (shouldRender) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [closeCartModal, shouldRender]);

  const handlePayClick = async () => {
    if (loading) return;

    if (cartItems.length === 0) {
      toast.error("El carrito esta vacio");
      return;
    }

    try {
      setIsCreatingOrder(true);

      const sessionId = !isAuthenticated && cart?.sessionId ? cart.sessionId : undefined;
      const res = await orderService.create(sessionId);

      if (!res || !res.id) {
        throw new Error("No se pudo crear la orden");
      }

      clear();
      closeCartModal();
      router.push(`/checkout?orderNumber=${res.orderNumber}`);
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la orden");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateQuantity(id, Math.max(1, quantity));
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
  };

  const shippingLabel = useMemo(() => (cartItems.length > 0 ? "Gratis" : "-"), [cartItems.length]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={closeCartModal}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[99999] flex w-full max-w-full flex-col rounded-l-2xl bg-white shadow-2xl transition-transform duration-300 ease-out sm:max-w-[448px]",
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Carrito"
      >
        <div className="flex items-center justify-between border-b border-gray-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10">
              <ShoppingBag className="h-5 w-5 text-blue" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark">Carrito</h2>
              <p className="text-xs text-dark-4">
                {itemCount} {itemCount === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>

          <button
            onClick={closeCartModal}
            className="flex h-10 w-10 items-center justify-center rounded-full text-dark-4 transition-colors hover:bg-gray-2 hover:text-dark"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-2">
                <ShoppingBag className="h-10 w-10 text-dark-4" />
              </div>
              <div>
                <p className="font-medium text-dark">Tu carrito esta vacio</p>
                <p className="mt-1 text-sm text-dark-4">Agrega productos para comenzar</p>
              </div>
              <Button asChild onClick={closeCartModal} className="mt-2">
                <Link href="/productos">Seguir comprando</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-3">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-3 bg-gray-1/50 p-4 sm:p-6">
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-4">Subtotal</span>
                <span className="font-medium text-dark">{formatter.format(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-4">Envio</span>
                <span className="font-medium text-green">{shippingLabel}</span>
              </div>
              <div className="h-px bg-gray-3" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-dark">Total</span>
                <span className="text-xl font-bold text-dark">{formatter.format(totalPrice)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 rounded-xl" onClick={closeCartModal}>
                <Link href="/cart">Ver carrito</Link>
              </Button>
              <Button
                className="flex-1 gap-2 rounded-xl"
                onClick={handlePayClick}
                disabled={isCreatingOrder || cartItems.length === 0}
              >
                {isCreatingOrder ? "Procesando..." : "Pagar"}
                {!isCreatingOrder && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: StoreCartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const attributes = useMemo(() => parseAttributes(item.attributesJson), [item.attributesJson]);
  const format = useMemo(() => {
    if (!attributes) return null;
    const preferred = attributes.Formato ?? attributes.formato;
    if (preferred) return formatDisplayValue(preferred);
    return Object.values(attributes)[0] ? formatDisplayValue(Object.values(attributes)[0]) : null;
  }, [attributes]);

  const handleRemove = () => {
    setIsRemoving(true);
    window.setTimeout(() => onRemove(item.id), 200);
  };

  const subtotal = item.subtotal ?? item.discountedPriceAtAddition * item.quantity;
  const hasDiscount = item.unitDiscountedPrice < item.unitPrice;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 transition-all duration-200 sm:gap-4 sm:p-6",
        isRemoving && "translate-x-full opacity-0"
      )}
    >
      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-2 sm:h-24 sm:w-20">
        {item.imageUrl ? (
          <CloudinaryImage
            src={item.imageUrl}
            alt={item.name}
            width={96}
            height={120}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src="/placeholder.png"
            alt={item.name}
            width={96}
            height={120}
            className="h-full w-full object-cover"
          />
        )}
        {hasDiscount && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red text-[8px] font-bold text-white sm:h-6 sm:w-6 sm:text-[10px]">
            %
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-dark sm:text-base">{item.name}</h3>
            {format && (
              <span className="mt-0.5 inline-block rounded bg-gray-2 px-1.5 py-0.5 text-[10px] font-medium text-dark-4 sm:text-xs">
                {format}
              </span>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-dark-4 transition-colors hover:bg-red-light-6 hover:text-red sm:h-9 sm:w-9"
            aria-label="Eliminar producto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-dark sm:text-base">{formatter.format(item.unitDiscountedPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-dark-4 line-through sm:text-sm">{formatter.format(item.unitPrice)}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-lg border border-gray-3 bg-white">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="flex h-8 w-8 items-center justify-center text-dark-4 transition-colors hover:bg-gray-2 hover:text-dark disabled:opacity-50"
              disabled={item.quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-dark">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-dark-4 transition-colors hover:bg-gray-2 hover:text-dark"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wide text-dark-4 sm:text-xs">Subtotal</span>
            <p className="text-sm font-bold text-dark sm:text-base">{formatter.format(subtotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartSidebarModal;
