"use client";
import React, { useEffect, useMemo, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useCart } from "@/hooks/useCart";
import { useDispatch } from "react-redux";
import Image from "next/image";
import CloudinaryImage from "@/components/Common/CloudinaryImage";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { toggleWishlist } from "@/redux/features/wishlist-slice";
import toast from "react-hot-toast";
import {
  productDetailsPublicService,
  type NormalizedProduct,
  type NormalizedVariant,
} from "@/services/productDetailsService";
import { PriceDisplay } from "@/components/Common/PriceDisplay";
import { useAuth } from "@/hooks/useAuth";

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });


const QuickViewModal = () => {
  const { isAuthenticated } = useAuth();
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const dispatch = useDispatch<AppDispatch>();
  const { addItem } = useCart(); // 👈
  // Producto "light" (del listado) — trae price/discountedPrice/imgs
  const product = useAppSelector((state) => state.quickViewReducer.value as {
    id: number;
    title: string;
    averageRating: number | null;
    totalReviews: number;
    price: number;
    discountedPrice: number;
    imgs?: { thumbnails: string[]; previews: string[] };
    fulfillmentType?: 'PHYSICAL' | 'DIGITAL_ON_DEMAND' | 'DIGITAL_INSTANT';
    priceWithTransfer?: number;
  } | null);


  // Estado local
  const [quantity, setQuantity] = useState(1);
  const [activePreview, setActivePreview] = useState(0);
  const [details, setDetails] = useState<NormalizedProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Variante seleccionada (si hay variantes)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const [showFullDesc, setShowFullDesc] = useState(false);

  // Wishlist state
  const wishlistItems = useAppSelector((s) => s.wishlistReducer.items);
  const isInWishlist = product ? wishlistItems.some((p) => p.id === product.id) : false;

  const description = details?.description ?? ""; // el "light" no suele traer description
  const shownDesc = useMemo(() => {
    if (!description) return "";
    const limit = 220; // caracteres
    return showFullDesc || description.length <= limit
      ? description
      : description.slice(0, limit) + "…";
  }, [description, showFullDesc]);


  // ------- Helpers -------
  const pickDefaultVariant = (d: NormalizedProduct): NormalizedVariant | undefined =>
    d.variants.find(v => v.stock > 0) ?? d.variants[0];

  // Construye SIEMPRE el payload que espera el carrito (incluye variante si corresponde)
  const buildCartItem = (
    d: NormalizedProduct | null,
    p: any, // product light
    qty: number,
    variant?: NormalizedVariant | null
  ) => {
    if (d) {
      if (d.hasVariants) {
        const v = variant ?? pickDefaultVariant(d);
        const price = v?.price ?? 0;
        const discountedPrice = v?.discountedPrice ?? price;

        return {
          id: d.id,
          title: d.title,
          price,
          discountedPrice,
          imgs: { thumbnails: (v?.images ?? d.images) ?? [], previews: (v?.images ?? d.images) ?? [] },
          quantity: qty,
          variantId: v?.id,
          variantAttrs: v?.attrs ?? {},
        };
      } else {
        const price = d.price ?? 0;
        const discountedPrice = d.discountedPrice ?? price;

        return {
          id: d.id,
          title: d.title,
          price,
          discountedPrice,
          imgs: { thumbnails: d.images ?? [], previews: d.images ?? [] },
          quantity: qty,
        };
      }
    }
    // fallback: usar objeto “light”
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      discountedPrice: p.discountedPrice ?? p.price,
      imgs: p.imgs ?? { thumbnails: [], previews: [] },
      quantity: qty,
    };
  };

  // ------- Fetch de DETAILS cuando abre el modal -------
  useEffect(() => {
    if (!isModalOpen || !product?.id) return;

    let cancelled = false;
    setLoading(true);
    setErr(null);
    setActivePreview(0);

    (async () => {
      try {
        const d = await productDetailsPublicService.getNormalized(product.id);
        if (cancelled) return;
        setDetails(d);
        // Preseleccionar variante por defecto si aplica
        if (d.hasVariants) {
          const def = pickDefaultVariant(d);
          setSelectedVariantId(def?.id ?? null);
        } else {
          setSelectedVariantId(null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("No se pudo cargar el producto.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      setDetails(null);
      setSelectedVariantId(null);
    };
  }, [isModalOpen, product?.id]);

  // Variante activa (objeto)
  const selectedVariant: NormalizedVariant | null = useMemo(() => {
    if (!details?.hasVariants) return null;
    return details.variants.find(v => v.id === selectedVariantId) ?? null;
  }, [details, selectedVariantId]);

  // Imágenes para galería (si hay variante elegida, usamos sus imágenes)
  const galleryImages: string[] = useMemo(() => {
    if (selectedVariant?.images?.length) return selectedVariant.images;
    if (details?.images?.length) return details.images;
    return product?.imgs?.previews ?? [];
  }, [selectedVariant, details, product]);

  // preview modal
  const handlePreviewSlider = () => {
    // Pasamos el detalle (incluye variantes) o el light como fallback
    dispatch(updateproductDetails(details ?? product));
    openPreviewModal();
  };

  // add to cart
  const handleAddToCart = async () => {
    const productId = details?.id ?? product?.id;
    if (!productId) return;

    // si el producto tiene variantes, necesitamos una seleccionada
    const variantId =
      details?.hasVariants ? (selectedVariantId ?? undefined) : undefined;

    if (details?.hasVariants && !variantId) {
      // acá podrías dar feedback si querés
      // toast("Elegí una variante", { icon: "👉" });
      return;
    }

    await addItem({
      productId,
      variantId,
      quantity, // del estado local
    });

    // (opcional): cerrar el modal o dar feedback
    // closeModal();
    // toast.success("Producto agregado");
  };


  // cerrar por click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".modal-content")) closeModal();
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      setQuantity(1);
      setActivePreview(0);
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;
  if (!product && !details) return null;

  const title = (details ?? product)?.title ?? "";

  // Stock UI: si hay variante seleccionada, usar su stock; sino el general
  const variantStock = selectedVariant
    ? selectedVariant.stock
    : details?.hasVariants
      ? undefined
      : details?.stockTotal;

  // Para productos digitales, no mostrar "out of stock" si es DIGITAL_ON_DEMAND
  // Priorizar el fulfillmentType del product (listado) sobre el details (API)
  const fulfillmentType = (product as any)?.fulfillmentType || (details as any)?.fulfillmentType;
  const isDigitalOnDemand = fulfillmentType === 'DIGITAL_ON_DEMAND';

  const inStock = isDigitalOnDemand
    ? true // Los productos DIGITAL_ON_DEMAND siempre están disponibles
    : variantStock !== undefined
      ? variantStock > 0
      : details?.inStock ?? true;

  // Lógica de precio con transferencia (Consistente con ShopDetails)
  let variantPriceWithTransfer: number | undefined;

  // 1. Precio base con transferencia del producto/detalles
  const basePriceWithTransfer = details?.priceWithTransfer ?? product?.priceWithTransfer;

  // 2. Precio de referencia para ratio (usando priceRange si price es null)
  const basePriceRef = details?.price
    ?? product?.price
    ?? details?.priceRange?.min
    ?? 0;

  // Calcular ratio globalmente para usarlo en el dropdown también
  const transferRatio = (basePriceWithTransfer && basePriceRef > 0)
    ? basePriceWithTransfer / basePriceRef
    : 0;

  if (selectedVariant) {
    // A) Si la variante tiene su propio precio transfer explícito
    if (selectedVariant.priceWithTransfer) {
      variantPriceWithTransfer = selectedVariant.priceWithTransfer;
    }
    // B) Si no, calcularlo usando el ratio del producto padre
    else if (transferRatio > 0) {
      variantPriceWithTransfer = selectedVariant.discountedPrice * transferRatio;
    }
  }

  // Cálculo de precios para el badge de oferta
  let badgeOriginalPrice = product?.price ?? 0;
  let badgeFinalPrice = product?.discountedPrice ?? 0;

  if (selectedVariant) {
    badgeOriginalPrice = selectedVariant.price;
    badgeFinalPrice = selectedVariant.discountedPrice;
  } else if (details && !details.hasVariants) {
    badgeOriginalPrice = details.price ?? 0;
    badgeFinalPrice = details.discountedPrice ?? 0;
  }

  const showDiscountBadge = badgeFinalPrice < badgeOriginalPrice;
  const discountPercentage = showDiscountBadge
    ? Math.round(((badgeOriginalPrice - badgeFinalPrice) / badgeOriginalPrice) * 100)
    : 0;


  return (
    <div
      className={`${isModalOpen ? "z-99999" : "hidden"
        } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          {/* close */}
          <button
            onClick={() => closeModal()}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div className="flex flex-wrap items-center gap-12.5">
            {/* ===== GALERÍA ===== */}
            <div className="max-w-[526px] w-full">
              <div className="flex gap-5">
                <div className="flex flex-col gap-5">
                  {galleryImages.map((img, key) => (
                    <button
                      onClick={() => setActivePreview(key)}
                      key={key}
                      className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${activePreview === key && "border-2 border-blue"
                        }`}
                    >
                      <CloudinaryImage
                        src={img || ""}
                        alt="thumbnail"
                        width={61}
                        height={61}
                        className="aspect-square object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[508px] bg-gray-1 rounded-lg border border-gray-3">
                  <div>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="button for zoom"
                      className="gallery__Image w-10 h-10 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-8 right-4 lg:right-8 z-50"
                    >
                      {/* zoom icon... */}
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <CloudinaryImage
                      src={galleryImages[activePreview] || ""}
                      alt="products-details"
                      width={400}
                      height={400}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== INFO ===== */}
            <div className="max-w-[445px] w-full">
              {showDiscountBadge && (
                <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-green mb-6.5">
                  OFERTA {discountPercentage}% OFF
                </span>
              )}

              <h3 className="font-semibold text-xl xl:text-heading-5 text-dark mb-4">
                {title}
              </h3>

              {/* Descripción */}
              {description && (
                <div className="mb-5">
                  <p className="text-dark-2 whitespace-pre-line">{shownDesc}</p>
                  {description.length > 220 && (
                    <button
                      type="button"
                      onClick={() => setShowFullDesc(v => !v)}
                      className="mt-2 text-blue hover:underline"
                    >
                      {showFullDesc ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </div>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2 mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_375_9221)">
                    <path
                      d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                      fill="#22AD5C"
                    />
                    <path
                      d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                      fill="#22AD5C"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_375_9221">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="font-medium text-dark">
                  {isDigitalOnDemand
                    ? "Disponible bajo demanda"
                    : inStock
                      ? `En Stock${typeof variantStock === "number" ? ` (${variantStock})` : ""}`
                      : "Sin Stock"}
                </span>
              </div>

              {/* Selector de variante (si aplica) */}
              {details?.hasVariants && details.variants.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm text-dark mb-2">Variante</label>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={selectedVariantId ?? undefined}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedVariantId(Number.isNaN(id) ? null : id);
                      setActivePreview(0);
                    }}
                  >
                    {details.variants.map(v => {
                      // Label amigable: combina attrs si existen
                      const attrLabel = Object.entries(v.attrs ?? {})
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(" · ");
                      const label = attrLabel || `Variante #${v.id}`;
                      const sfx = (v.stock > 0 || fulfillmentType === 'DIGITAL_ON_DEMAND') ? "" : " — (Sin stock)";
                      return (
                        <option key={v.id} value={v.id}>
                          {label} — {currency.format(v.discountedPrice)}{sfx}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Precio */}
              <div className="flex flex-wrap justify-between gap-5 mt-4 mb-7.5">
                <div>
                  <h4 className="font-semibold text-lg text-dark mb-3.5">Precio</h4>

                  {/* Con variante seleccionada: mostrar precio de la variante */}
                  {details?.hasVariants ? (
                    selectedVariant ? (
                      <PriceDisplay
                        price={selectedVariant.price}
                        discountedPrice={selectedVariant.discountedPrice}
                        priceWithTransfer={variantPriceWithTransfer}
                        size="xl"
                      />
                    ) : (
                      // Si no hay variante (raro), mostrar rango
                      <span className="font-semibold text-dark text-xl xl:text-heading-4">
                        {currency.format(details.priceRange.minDiscounted)} – {currency.format(details.priceRange.maxDiscounted)}
                      </span>
                    )
                  ) : details ? (
                    // Sin variantes: usar price del detalle
                    <PriceDisplay
                      price={details.price!}
                      discountedPrice={details.discountedPrice ?? details.price!}
                      priceWithTransfer={basePriceWithTransfer}
                      size="xl"
                    />
                  ) : (
                    // Fallback del “light”
                    <PriceDisplay
                      price={product?.price ?? 0}
                      discountedPrice={product?.discountedPrice ?? product?.price ?? 0}
                      priceWithTransfer={basePriceWithTransfer}
                      size="xl"
                    />
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <h4 className="font-semibold text-lg text-dark mb-3.5">Cantidad</h4>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      aria-label="button for remove product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
                    >
                      <svg
                        className="fill-current"
                        width="16"
                        height="2"
                        viewBox="0 0 16 2"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M-8.548e-08 0.977778C-3.82707e-08 0.437766 0.437766 3.82707e-08 0.977778 8.548e-08L15.0222 1.31328e-06C15.5622 1.36049e-06 16 0.437767 16 0.977779C16 1.51779 15.5622 1.95556 15.0222 1.95556L0.977778 1.95556C0.437766 1.95556 -1.32689e-07 1.51779 -8.548e-08 0.977778Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <span className="flex items-center justify-center w-20 h-10 rounded-[5px] border border-gray-4 bg-white font-medium text-dark">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const max = isDigitalOnDemand ? 9999 : (variantStock ?? 9999);
                        setQuantity(q => Math.min(q + 1, max));
                      }}
                      aria-label="button for add product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
                    >
                      <svg
                        className="fill-current"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.08889 0C8.6289 2.36047e-08 9.06667 0.437766 9.06667 0.977778L9.06667 15.0222C9.06667 15.5622 8.6289 16 8.08889 16C7.54888 16 7.11111 15.5622 7.11111 15.0222L7.11111 0.977778C7.11111 0.437766 7.54888 -2.36047e-08 8.08889 0Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 7.91111C4.72093e-08 7.3711 0.437766 6.93333 0.977778 6.93333L15.0222 6.93333C15.5622 6.93333 16 7.3711 16 7.91111C16 8.45112 15.5622 8.88889 15.0222 8.88889L0.977778 8.88889C0.437766 8.88889 -4.72093e-08 8.45112 0 7.91111Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                  {typeof variantStock === "number" && (
                    <p className="text-xs text-dark-4 mt-1">Stock variante: {variantStock}</p>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={!inStock || quantity === 0}
                  onClick={handleAddToCart}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
                >
                  {inStock ? "Agregar" : "Sin Stock"}
                </button>

                <button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      toast.error("Debes iniciar sesión para usar la wishlist");
                      return;
                    }
                    if (product) {
                      const res = await dispatch(toggleWishlist(product as any));
                      const products = res.payload as any[] | undefined;
                      if (products) {
                        const isIn = products.some((p) => p.id === product.id);
                        toast(isIn ? "Añadido a tu wishlist" : "Quitado de tu wishlist");
                      }
                    }
                  }}
                  className={`inline-flex items-center gap-2 font-medium py-3 px-6 rounded-md ease-out duration-200 ${isInWishlist
                    ? "bg-blue text-white hover:bg-blue-dark"
                    : "bg-dark text-white hover:bg-opacity-95"
                    }`}
                >
                  {/* heart icon */}
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.68698 3.68688C3.30449 4.31882 2.29169 5.82191 2.29169 7.6143C2.29169 9.44546 3.04103 10.8569 4.11526 12.0665C5.00062 13.0635 6.07238 13.8897 7.11763 14.6956C7.36588 14.8869 7.61265 15.0772 7.85506 15.2683C8.29342 15.6139 8.68445 15.9172 9.06136 16.1374C9.43847 16.3578 9.74202 16.4584 10 16.4584C10.258 16.4584 10.5616 16.3578 10.9387 16.1374C11.3156 15.9172 11.7066 15.6139 12.145 15.2683C12.3874 15.0772 12.6342 14.8869 12.8824 14.6956C13.9277 13.8897 14.9994 13.0635 15.8848 12.0665C16.959 10.8569 17.7084 9.44546 17.7084 7.6143C17.7084 5.82191 16.6955 4.31882 15.3131 3.68688C13.97 3.07295 12.1653 3.23553 10.4503 5.01733C10.3325 5.13974 10.1699 5.20891 10 5.20891C9.83012 5.20891 9.66754 5.13974 9.54972 5.01733C7.83474 3.23553 6.03008 3.07295 4.68698 3.68688ZM10 3.71573C8.07331 1.99192 5.91582 1.75077 4.16732 2.55002C2.32061 3.39415 1.04169 5.35424 1.04169 7.6143C1.04169 9.83557 1.9671 11.5301 3.18062 12.8966C4.15241 13.9908 5.34187 14.9067 6.39237 15.7155C6.63051 15.8989 6.8615 16.0767 7.0812 16.2499C7.50807 16.5864 7.96631 16.9453 8.43071 17.2166C8.8949 17.4879 9.42469 17.7084 10 17.7084C10.5754 17.7084 11.1051 17.4879 11.5693 17.2166C12.0337 16.9453 12.492 16.5864 12.9188 16.2499C13.1385 16.0767 13.3695 15.8989 13.6077 15.7155C14.6582 14.9067 15.8476 13.9908 16.8194 12.8966C18.0329 11.5301 18.9584 9.83557 18.9584 7.6143C18.9584 5.35424 17.6794 3.39415 15.8327 2.55002C14.0842 1.75077 11.9267 1.99192 10 3.71573Z"
                      fill=""
                    />
                  </svg>
                  {isInWishlist ? "En Lista de Deseos" : "Agregar a Lista de Deseos"}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
              Cargando…
            </div>
          )}
          {err && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-red-600">
              {err}
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default QuickViewModal;
