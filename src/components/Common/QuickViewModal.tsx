"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  X,
  Minus,
  Plus,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CloudinaryImage from "@/components/Common/CloudinaryImage";
import { ProductGridSkeleton } from "@/components/Common/Skeletons";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import {
  productDetailsPublicService,
  type NormalizedProduct,
  type NormalizedVariant,
} from "@/services/productDetailsService";
import { updateproductDetails } from "@/redux/features/product-details";
import { toggleWishlist } from "@/redux/features/wishlist-slice";
import { generateProductUrl } from "@/utils/slug";
import * as pixel from "@/utils/pixel";
import * as analytics from "@/utils/analytics";

type QuickViewProductLight = {
  id: number;
  title: string;
  averageRating: number | null;
  totalReviews: number;
  price: number;
  discountedPrice: number;
  imgs?: { urls: string[] };
  fulfillmentType?: "PHYSICAL" | "DIGITAL_ON_DEMAND" | "DIGITAL_INSTANT";
  priceWithTransfer?: number;
  isPresale?: boolean;
  releaseDate?: string | null;
  productType?: "GAME" | "DLC" | "CONSOLE" | "ACCESSORY" | "OTHER";
};

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const getFulfillmentLabel = (type?: NormalizedProduct["fulfillmentType"]) => {
  switch (type) {
    case "DIGITAL_ON_DEMAND":
      return "Digital bajo demanda";
    case "DIGITAL_INSTANT":
      return "Digital instantaneo";
    case "PHYSICAL":
    default:
      return "Fisico";
  }
};

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

const getProductTypeLabel = (type?: NormalizedProduct["productType"]) => {
  switch (type) {
    case "GAME":
      return "Juego";
    case "DLC":
      return "DLC";
    case "CONSOLE":
      return "Consola";
    case "ACCESSORY":
      return "Accesorio";
    case "OTHER":
      return "Otro";
    default:
      return null;
  }
};

const QuickViewModal = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const product = useAppSelector((state) => state.quickViewReducer.value as QuickViewProductLight | null);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<NormalizedProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
      return;
    }

    setIsAnimating(false);
    const timer = window.setTimeout(() => setShouldRender(false), 300);
    return () => window.clearTimeout(timer);
  }, [isModalOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || !product?.id) return;

    let cancelled = false;
    setLoading(true);
    setErr(null);
    setSelectedImage(0);
    setQuantity(1);

    const fetchDetails = async () => {
      try {
        const fetchedDetails = await productDetailsPublicService.getNormalized(product.id);
        if (cancelled) return;

        setDetails(fetchedDetails);

        if (fetchedDetails.hasVariants && fetchedDetails.variants.length > 0) {
          const defaultVariant = fetchedDetails.variants.find((variant) => variant.stock > 0) ?? fetchedDetails.variants[0];
          setSelectedVariantId(defaultVariant?.id ?? null);
          setSelectedAttrs(defaultVariant?.attrs ?? {});
        } else {
          setSelectedVariantId(null);
          setSelectedAttrs({});
        }

        pixel.event("ViewContent", {
          content_name: fetchedDetails.title,
          content_ids: [fetchedDetails.id],
          content_type: fetchedDetails.productType?.toLowerCase() || "product",
          value:
            fetchedDetails.discountedPrice ||
            fetchedDetails.price ||
            fetchedDetails.priceRange.minDiscounted,
          currency: "ARS",
        });
        analytics.trackViewItem(
          analytics.toAnalyticsItem({
            id: fetchedDetails.id,
            name: fetchedDetails.title,
            price:
              fetchedDetails.discountedPrice ||
              fetchedDetails.price ||
              fetchedDetails.priceRange.minDiscounted,
            category: fetchedDetails.category,
          }),
          fetchedDetails.discountedPrice ||
            fetchedDetails.price ||
            fetchedDetails.priceRange.minDiscounted
        );
      } catch (error) {
        console.error(error);
        if (!cancelled) setErr("No se pudo cargar el producto.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
      setDetails(null);
      setSelectedVariantId(null);
      setSelectedAttrs({});
    };
  }, [isModalOpen, product?.id]);

  const selectedVariant: NormalizedVariant | null = useMemo(() => {
    if (!details?.hasVariants) return null;
    return details.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  }, [details, selectedVariantId]);

  const galleryImages = useMemo(() => {
    const variantImages = selectedVariant?.images ?? [];
    const baseImages = details?.images ?? product?.imgs?.urls ?? [];
    return Array.from(new Set([...variantImages, ...baseImages])).filter(Boolean);
  }, [details?.images, product?.imgs?.urls, selectedVariant?.images]);

  const currentPrice = selectedVariant
    ? selectedVariant.discountedPrice
    : details?.discountedPrice ?? product?.discountedPrice ?? details?.priceRange.minDiscounted ?? 0;

  const originalPrice = selectedVariant
    ? selectedVariant.price
    : details?.price ?? product?.price ?? details?.priceRange.min ?? currentPrice;

  const basePriceWithTransfer = details?.priceWithTransfer ?? product?.priceWithTransfer;
  const basePriceRef = details?.price ?? product?.price ?? details?.priceRange.min ?? 0;

  let transferPrice: number | undefined;
  if (selectedVariant) {
    if (selectedVariant.priceWithTransfer) {
      transferPrice = selectedVariant.priceWithTransfer;
    } else if (basePriceWithTransfer && basePriceRef > 0) {
      transferPrice = selectedVariant.discountedPrice * (basePriceWithTransfer / basePriceRef);
    }
  } else {
    transferPrice = basePriceWithTransfer;
  }

  const variantStock = selectedVariant
    ? selectedVariant.stock
    : details?.hasVariants
      ? undefined
      : details?.stockTotal;

  const fulfillmentType = product?.fulfillmentType || details?.fulfillmentType;
  const isDigitalOnDemand = fulfillmentType === "DIGITAL_ON_DEMAND";
  const inStock = isDigitalOnDemand ? true : variantStock !== undefined ? variantStock > 0 : (details?.inStock ?? true);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const title = details?.title || product?.title || "";
  const description = details?.description ?? "";
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;

  const tags = useMemo(() => {
    if (!details && !product) return [];

    const collected = [
      details?.category,
      details?.brand,
      details ? getProductTypeLabel(details.productType) : getProductTypeLabel(product?.productType),
      fulfillmentType ? getFulfillmentLabel(fulfillmentType) : null,
    ];

    return Array.from(new Set(collected.filter(Boolean))) as string[];
  }, [details, fulfillmentType, product?.productType]);

  const handleAttrChange = (key: string, value: string) => {
    const newAttrs = { ...selectedAttrs, [key]: value };
    setSelectedAttrs(newAttrs);

    const variant = details?.variants.find((item) =>
      Object.entries(newAttrs).every(([attrKey, attrValue]) => item.attrs[attrKey] === attrValue)
    );

    if (variant) {
      setSelectedVariantId(variant.id);
      setSelectedImage(0);
      return;
    }

    const partialMatch = details?.variants.find((item) => item.attrs[key] === value);
    if (partialMatch) {
      setSelectedVariantId(partialMatch.id);
      setSelectedAttrs(partialMatch.attrs);
      setSelectedImage(0);
    }
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedImage((current) => (current + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedImage((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleOpenPreview = () => {
    const payload = details
      ? { ...details, images: galleryImages }
      : { ...product, imgs: { ...product?.imgs, urls: galleryImages } };

    dispatch(updateproductDetails(payload as never));
    openPreviewModal();
  };

  const handleViewDetails = () => {
    if (!product) return;
    dispatch(updateproductDetails({ ...(details ?? product) } as never));
    closeModal();
    router.push(generateProductUrl(product.id, title));
  };

  const handleAddToCart = async () => {
    const productId = details?.id ?? product?.id;
    if (!productId) return;

    if (details?.hasVariants && !selectedVariantId) {
      toast.error("Debes elegir una variante");
      return;
    }

    try {
      await addItem({
        productId,
        variantId: details?.hasVariants ? (selectedVariantId ?? undefined) : undefined,
        quantity,
        price: currentPrice,
      });
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo agregar el producto al carrito.");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para usar la wishlist");
      return;
    }

    if (!product) return;

    const result = await dispatch(toggleWishlist((details ?? product) as never));
    const products = result.payload as { id: number }[] | undefined;

    if (products) {
      const isNowInWishlist = products.some((item) => item.id === product.id);
      toast(isNowInWishlist ? "Añadido a tu wishlist" : "Quitado de tu wishlist");

      if (isNowInWishlist) {
        pixel.event("AddToWishlist", {
          content_name: title,
          content_ids: [product.id],
          content_type: details?.productType?.toLowerCase() || "product",
          value: currentPrice,
          currency: "ARS",
        });
        analytics.trackAddToWishlist(
          analytics.toAnalyticsItem({
            id: product.id,
            name: title,
            price: currentPrice,
          }),
          currentPrice
        );
      }
    }
  };

  if (!shouldRender || (!product && !details)) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[99998] bg-dark/70 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={closeModal}
      />

      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6">
        <div
          className={cn(
            "relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300",
            "max-h-[90vh] sm:max-h-[85vh]",
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          <button
            onClick={closeModal}
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-dark-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-dark sm:right-3 sm:top-3 sm:h-9 sm:w-9"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
            <div className="relative bg-gray-1 p-4 sm:w-[45%] sm:p-5">
              {hasDiscount && (
                <div className="absolute left-0 top-6 z-10">
                  <span className="rounded-r-full bg-red px-2.5 py-1 text-[10px] font-bold text-white shadow sm:px-3 sm:text-xs">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

              <button
                onClick={handleOpenPreview}
                className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition-all hover:bg-white"
                aria-label="Expandir imagen"
              >
                <Expand className="h-4 w-4 text-dark" />
              </button>

              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="aspect-[3/4]">
                  {loading ? (
                    <div className="p-4"><ProductGridSkeleton count={1} /></div>
                  ) : err ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red">{err}</div>
                  ) : (
                    <CloudinaryImage
                      src={galleryImages[selectedImage] || "/placeholder.png"}
                      alt={title}
                      width={500}
                      height={700}
                      className="h-full w-full object-contain p-4"
                    />
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition-all hover:bg-white active:scale-95"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-4 w-4 text-dark" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition-all hover:bg-white active:scale-95"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="h-4 w-4 text-dark" />
                    </button>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all sm:h-16 sm:w-16",
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <CloudinaryImage
                        src={image}
                        alt={`${title} - ${index + 1}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:w-[55%] sm:p-6">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="mt-3 text-lg font-bold leading-snug text-dark sm:text-xl">{title}</h2>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                {inStock && (
                  <div className="flex items-center gap-1.5 text-green">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">Disponible</span>
                  </div>
                )}
              </div>

              {description && (
                <div className="mt-4 max-h-24 overflow-y-auto rounded-lg border border-gray-3 bg-gray-1/40 p-3">
                  <p className="text-sm leading-relaxed text-dark-4">{description}</p>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-gray-1/60 p-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-bold text-dark">{formatCurrency(currentPrice)}</span>
                  {hasDiscount && (
                    <span className="text-base text-dark-4 line-through">{formatCurrency(originalPrice)}</span>
                  )}
                </div>
                {transferPrice && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-green">{formatCurrency(transferPrice)}</span>
                    <span className="rounded-full bg-green-light-6 px-2 py-0.5 text-xs font-semibold uppercase text-green-dark">
                      Transferencia
                    </span>
                  </div>
                )}
              </div>

              <div className="my-4 h-px bg-gray-3" />

              <div className="mt-auto space-y-4">
                {details?.hasVariants && Object.keys(details.options).length > 0 ? (
                  <div>
                    <span className="mb-2 block text-xs font-medium text-dark-4">Formato</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(details.options).map(([optionName, values]) => (
                        <div key={optionName} className="w-full">
                          {Object.keys(details.options).length > 1 && (
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-dark-4">
                              {optionName}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {values.map((value) => {
                              const isSelected = selectedAttrs[optionName] === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => handleAttrChange(optionName, value)}
                                  className={cn(
                                    "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-gray-3 bg-white text-dark hover:border-primary/50"
                                  )}
                                >
                                  {formatDisplayValue(value)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-end gap-4">
                  <div>
                    <span className="mb-2 block text-xs font-medium text-dark-4">Cantidad</span>
                    <div className="flex items-center rounded-lg border border-gray-3">
                      <button
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        className="flex h-10 w-10 items-center justify-center text-dark-4 transition-colors hover:bg-gray-2 hover:text-dark disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-dark">{quantity}</span>
                      <button
                        onClick={() => {
                          const max = isDigitalOnDemand ? 9999 : variantStock ?? 9999;
                          setQuantity((current) => Math.min(current + 1, max));
                        }}
                        className="flex h-10 w-10 items-center justify-center text-dark-4 transition-colors hover:bg-gray-2 hover:text-dark"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {typeof variantStock === "number" && !isDigitalOnDemand && (
                    <span className="mb-2 text-xs text-dark-4">Stock: {variantStock} unidades</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button size="lg" className="flex-1 rounded-xl" onClick={handleAddToCart} disabled={!inStock}>
                    {inStock ? "Agregar al carrito" : "Sin stock"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={cn("gap-2 rounded-xl px-4", isWishlisted && "border-red-light-4 bg-red-light-6")}
                    onClick={handleToggleWishlist}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isWishlisted ? "fill-red text-red" : "text-dark"
                      )}
                    />
                    <span className="hidden sm:inline">Favoritos</span>
                  </Button>
                </div>

                <button
                  onClick={handleViewDetails}
                  className="w-full text-center text-sm font-medium text-blue underline-offset-2 hover:underline"
                >
                  Ver todos los detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
