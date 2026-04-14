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
import { Heart, Eye, Star, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SingleListItem = ({ item }: { item: Product }) => {
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
      price: item.discountedPrice || item.price,
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
      className="group relative font-sans flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg sm:flex-row"
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
      
      {/* Contenedor de imagen (Izquierda en desktop, Arriba en mobile) */}
      <div className="relative aspect-[4/3] sm:aspect-square sm:w-[270px] sm:shrink-0 flex items-center justify-center overflow-hidden bg-neutral-50/80 border-b sm:border-b-0 sm:border-r border-gray-100">
        
        {/* Imagen Original con object-contain */}
        <CloudinaryImage
          src={imgSrc}
          alt={item.title}
          fill
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105 z-10 drop-shadow-md mix-blend-multiply"
          sizes="(max-width: 768px) 100vw, 270px"
        />

        {/* Badge de descuento */}
        {hasDiscount && (
          <div className="absolute left-0 top-6 z-20">
            <span className="rounded-r-full bg-[#fa3e46] px-3.5 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm">
              {Math.round(((item.price - (item.discountedPrice || item.price)) / item.price) * 100)}% OFF
            </span>
          </div>
        )}

        {/* Badge preventa */}
        {item.isPresale && (
          <div className="absolute left-0 bottom-3 z-20">
            <span className="rounded-r-full bg-[#7c3aed] px-3 py-1 text-xs font-bold text-white shadow-sm tracking-wide uppercase">
              Preventa
            </span>
          </div>
        )}

        {/* Tags oscuros apilados (Digital, DLC, Consola) */}
        <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
          {(item.fulfillmentType === 'DIGITAL_ON_DEMAND' || item.fulfillmentType === 'DIGITAL_INSTANT') && (
            <span className="rounded-[8px] bg-[#1a1a1a] px-3 py-1.5 text-[13px] font-medium text-white shadow-sm">
              Digital
            </span>
          )}
          {item.productType === 'DLC' && (
            <span className="rounded-[8px] bg-[#1a1a1a] px-3 py-1.5 text-[13px] font-medium text-white shadow-sm">
              DLC
            </span>
          )}
          {item.consoleName && (
            <span className="rounded-[8px] bg-[#1a1a1a] px-3 py-1.5 text-[13px] font-medium text-white shadow-sm">
              {item.consoleName}
            </span>
          )}
        </div>

        {/* Botones de accion — Siempre visibles en mobile, hover en desktop */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-3 px-5 transition-all duration-300 sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleQuickViewUpdate();
              openModal();
            }}
            className="hidden sm:flex h-11 w-11 shrink-0 rounded-full bg-white shadow-md hover:bg-neutral-50"
          >
            <Eye className="h-5 w-5 text-gray-800" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            className="h-11 w-11 shrink-0 rounded-full bg-dark text-white shadow-md hover:bg-dark-2"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "hidden sm:flex h-11 w-11 shrink-0 rounded-full bg-white shadow-md hover:bg-neutral-50",
              isInWishlist && "bg-red-50"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleItemToWishList();
            }}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isInWishlist ? "fill-[#fa3e46] text-[#fa3e46]" : "text-gray-800"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Contenido de la tarjeta (Derecha en desktop, Abajo en mobile) */}
      <div className="flex flex-1 flex-col gap-3 p-6 lg:p-8 bg-white z-10">
        
        {/* Rating & Review */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-[16px] w-[16px]",
                  i < (item.averageRating || 0)
                    ? "fill-[#facc15] text-[#facc15]"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="text-[14px] font-medium text-gray-500">({item.totalReviews} reseñas)</span>
        </div>

        {/* Nombre del producto */}
        <h3 className="line-clamp-2 text-[20px] font-semibold leading-tight text-gray-900 ease-out duration-200 hover:text-blue">
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
        
        {/* Precios & Botón de agregar */}
        <div className="mt-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            {item.discountedPrice && item.discountedPrice < item.price ? (
               <div className="flex items-end gap-2.5">
                  <span className="text-[24px] tracking-tight font-bold text-gray-900 leading-none">
                      $ {item.discountedPrice.toLocaleString("es-AR")}
                  </span>
                  <span className="text-[16px] text-gray-400 line-through font-medium leading-none mb-0.5">
                      $ {item.price.toLocaleString("es-AR")}
                  </span>
               </div>
            ) : (
              <div className="flex items-end gap-2 text-gray-900">
                 <span className="text-[24px] tracking-tight font-bold leading-none">
                     $ {item.price.toLocaleString("es-AR")}
                 </span>
              </div>
            )}
            
            {item.priceWithTransfer && (
              <div className="flex items-center gap-2.5 mt-2">
                <span className="text-[19px] tracking-tight font-bold text-[#16a34a] leading-none">
                  $ {item.priceWithTransfer.toLocaleString("es-AR")}
                </span>
                <span className="rounded bg-[#dcfce7] px-2 py-[3px] text-[12px] font-bold uppercase tracking-wider text-[#16a34a]">
                  Transferencia
                </span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full sm:w-auto rounded-full px-8 h-12 shadow-md bg-blue border-none text-white hover:bg-[#002f6c] text-[15px] font-medium"
          >
            Agregar al carrito
          </Button>
        </div>
      </div>

    </div>
  );
};

export default SingleListItem;
