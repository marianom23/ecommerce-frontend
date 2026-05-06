"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useCart } from "@/hooks/useCart";
import { toggleWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useAppSelector } from "@/redux/store";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CloudinaryImage from "@/components/Common/CloudinaryImage";
import { updateproductDetails } from "@/redux/features/product-details";
import { generateProductUrl } from "@/utils/slug";
import { useAuth } from "@/hooks/useAuth";
import * as pixel from "@/utils/pixel";
import * as analytics from "@/utils/analytics";
import { Heart, Eye, Star, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const SingleGridItem = ({ item, variant = "default" }: { item: Product; variant?: "default" | "cover" }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((s) => s.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((p) => p.id === item.id);
  const { addItem } = useCart();
  const shouldOpenVariantPicker = (p: Product) =>
    p.variantCount === 0 || p.variantCount > 1 || p.defaultVariantId == null;

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = async () => {
    if (shouldOpenVariantPicker(item)) {
      dispatch(updateQuickView({ ...item }));
      openModal();
      toast("Debes elegir una variante del producto", { icon: "👈" });
      return;
    }
    await addItem({
      productId: item.id,
      variantId: item.defaultVariantId,
      quantity: 1,
      price: item.discountedPrice || item.price
    });
  };

  const handleItemToWishList = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para usar la wishlist");
      return;
    }
    const res = await dispatch(toggleWishlist(item));
    const products = res.payload as Product[] | undefined;
    if (products) {
      const isIn = products.some((p) => p.id === item.id);
      toast(isIn ? "Añadido a tu wishlist" : "Quitado de tu wishlist");
      if (isIn) {
        pixel.event("AddToWishlist", {
          content_name: item.title,
          content_ids: [item.id],
          content_type: "product",
          value: item.discountedPrice || item.price,
          currency: "ARS",
        });
        analytics.trackAddToWishlist(
          analytics.toAnalyticsItem({
            id: item.id,
            name: item.title,
            price: item.discountedPrice || item.price,
          }),
          item.discountedPrice || item.price
        );
      }
    }
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const imgSrc = item.imgs?.urls?.[0] ?? "/placeholder.png";
  const hasDiscount = item.discountedPrice && item.price > item.discountedPrice;
  const productUrl = generateProductUrl(item.id, item.title);

  const goToProductDetails = () => {
    const selectedText = window.getSelection?.()?.toString().trim();
    if (selectedText) return;
    handleProductDetails();
    router.push(productUrl);
  };

  return (
    <div
      className="group font-sans flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-3 bg-white transition-shadow duration-200 hover:shadow-3"
      onClick={goToProductDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProductDetails();
        }
      }}
      role="link"
      tabIndex={0}
    >

      {/* Zona de imagen */}
      <div className={cn(
        "relative w-full overflow-hidden bg-gray-1",
        variant === "cover" ? "aspect-[3/4]" : "aspect-square"
      )}>

        {/* Imagen */}
        <CloudinaryImage
          src={imgSrc}
          alt={item.title}
          fill
          className={cn(
            "transition-transform duration-300 group-hover:scale-105",
            variant === "cover" ? "object-cover" : "object-contain p-4"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badge descuento */}
        {hasDiscount && (
          <div className="absolute left-0 top-4 z-10 pointer-events-none">
            <span className="rounded-r-full bg-red px-3 py-1 text-xs font-bold text-white shadow-1">
              {Math.round(((item.price - (item.discountedPrice || item.price)) / item.price) * 100)}% OFF
            </span>
          </div>
        )}

        {/* Badge preventa */}
        {item.isPresale && (
          <div className="absolute left-0 bottom-3 z-10 pointer-events-none">
            <span className="rounded-r-full bg-[#7c3aed] px-3 py-1 text-xs font-bold text-white shadow-1 tracking-wide uppercase">
              Preventa
            </span>
          </div>
        )}

        {/* Tags: Digital, DLC, Consola */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {(item.fulfillmentType === 'DIGITAL_ON_DEMAND' || item.fulfillmentType === 'DIGITAL_INSTANT') && (
            <span className="rounded-md bg-dark px-2.5 py-1 text-xs font-semibold text-white shadow-1">
              Digital
            </span>
          )}
          {item.productType === 'DLC' && (
            <span className="rounded-md bg-dark px-2.5 py-1 text-xs font-semibold text-white shadow-1">
              DLC
            </span>
          )}

        </div>

        {/* Botones de accion — Siempre visibles en mobile, hover en desktop */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-3 px-5 transition-all duration-300 sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickViewUpdate();
              openModal();
            }}
            aria-label="Vista rápida"
            className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-1 transition-colors duration-200 hover:text-blue"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            aria-label="Agregar al carrito"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark text-white shadow-1 transition-colors duration-200 hover:bg-dark-2 sm:h-11 sm:w-auto sm:px-6 sm:gap-2 sm:text-sm sm:font-medium"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleItemToWishList();
            }}
            aria-label="Wishlist"
            className={cn(
              "hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-1 transition-colors duration-200",
              isInWishlist ? "text-red" : "hover:text-blue"
            )}
          >
            <Heart className={cn("h-4 w-4 transition-colors", isInWishlist && "fill-red text-red")} />
          </button>
        </div>
      </div>

      {/* Contenido textual */}
      <div className="flex flex-1 flex-col gap-2 p-4 bg-white">

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < (item.averageRating || 0) ? "fill-yellow text-yellow" : "fill-gray-4 text-gray-4"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-5">({item.totalReviews})</span>
        </div>

        {/* Nombre */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-dark ease-out duration-200 hover:text-blue">
          <Link
            href={productUrl}
            onClick={(e) => {
              e.stopPropagation();
              handleProductDetails();
            }}
          >
            {item.title}
          </Link>
        </h3>

        {/* Precios */}
        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          {item.discountedPrice && item.discountedPrice < item.price ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="whitespace-nowrap text-lg font-bold text-dark">$ {item.discountedPrice.toLocaleString("es-AR")}</span>
              <span className="whitespace-nowrap text-sm text-gray-4 line-through">$ {item.price.toLocaleString("es-AR")}</span>
            </div>
          ) : (
            <span className="whitespace-nowrap text-lg font-bold text-dark">$ {item.price.toLocaleString("es-AR")}</span>
          )}

          {item.priceWithTransfer && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="whitespace-nowrap text-base font-bold text-green">$ {item.priceWithTransfer.toLocaleString("es-AR")}</span>
              <span className="rounded bg-green-light-6 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-dark whitespace-nowrap">
                Transferencia
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleGridItem;
