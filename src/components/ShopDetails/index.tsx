"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import CloudinaryImage from "@/components/Common/CloudinaryImage";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { useCart } from "@/hooks/useCart";
import {
  productDetailsPublicService,
  type NormalizedProduct,
  type NormalizedVariant,
} from "@/services/productDetailsService";
import { updateproductDetails } from "@/redux/features/product-details";
import { toggleWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "@/redux/store";
import toast from "react-hot-toast";
import { reviewService } from "@/services/reviewService";
import { type ReviewRequest, type ReviewResponse } from "@/types/review";
import { ReviewsList } from "./ReviewsList";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import * as pixel from "@/utils/pixel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generateProductUrl } from "@/utils/slug";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

interface ShopDetailsProps {
  productId?: string;
}

type StoredProduct = {
  id?: number;
  title?: string;
  price?: number;
  discountedPrice?: number;
  priceWithTransfer?: number;
  imgs?: { urls?: string[] };
};

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

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

  if (mappedValues[normalized]) {
    return mappedValues[normalized];
  }

  return normalized
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ShopDetails = ({ productId }: ShopDetailsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [productDetails, setProductDetails] = useState<NormalizedProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [storedProduct, setStoredProduct] = useState<StoredProduct | null>(null);

  const productFromRedux = useAppSelector((state) => state.productDetailsReducer.value);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const currentUserId = user?.id;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("productDetails");
      if (raw) {
        setStoredProduct(JSON.parse(raw));
      }
    } catch {
      setStoredProduct(null);
    }
  }, []);

  const product = useMemo(() => {
    if (productId) {
      return { id: parseInt(productId, 10) };
    }

    return storedProduct?.id ? storedProduct : productFromRedux;
  }, [productId, productFromRedux, storedProduct]);

  useEffect(() => {
    if (!product?.id) return;

    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const details = await productDetailsPublicService.getNormalized(product.id as number);
        setProductDetails(details);

        if (details.hasVariants && details.variants.length > 0) {
          const defaultVariant = details.variants.find((variant) => variant.stock > 0) ?? details.variants[0];
          setSelectedVariantId(defaultVariant?.id ?? null);
          setSelectedAttrs(defaultVariant?.attrs ?? {});
        }

        dispatch(updateproductDetails(details));

        pixel.event("ViewContent", {
          content_name: details.title,
          content_ids: [details.id],
          content_type: details.productType?.toLowerCase() || "product",
          value: details.discountedPrice || details.price || details.priceRange.minDiscounted,
          currency: "USD",
        });
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("No pudimos cargar este producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [dispatch, product?.id]);

  useEffect(() => {
    if (!product?.id) return;

    const fetchReviews = async () => {
      try {
        const reviewsData = await reviewService.getReviewsByProduct(product.id as number);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id || !isAuthenticated) return;

    const fetchMyReview = async () => {
      try {
        const myReviewData = await reviewService.getMyReviewForProduct(product.id as number);
        setMyReview(myReviewData);
      } catch (err) {
        console.error("Error fetching my review:", err);
      }
    };

    fetchMyReview();
  }, [isAuthenticated, product?.id]);

  const selectedVariant: NormalizedVariant | null = productDetails?.hasVariants
    ? productDetails.variants.find((variant) => variant.id === selectedVariantId) ?? null
    : null;

  const currentImages = useMemo(() => {
    const variantImages = selectedVariant?.images ?? [];
    const baseImages = productDetails?.images ?? product?.imgs?.urls ?? [];

    return Array.from(new Set([...variantImages, ...baseImages])).filter(Boolean);
  }, [product?.imgs?.urls, productDetails?.images, selectedVariant?.images]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariantId]);

  const currentPrice = selectedVariant
    ? selectedVariant.discountedPrice
    : productDetails?.discountedPrice ?? product?.discountedPrice ?? productDetails?.priceRange.minDiscounted ?? 0;

  const originalPrice = selectedVariant
    ? selectedVariant.price
    : productDetails?.price ?? product?.price ?? productDetails?.priceRange.min ?? currentPrice;

  let currentPriceWithTransfer: number | undefined;
  const basePriceWithTransfer = productDetails?.priceWithTransfer ?? product?.priceWithTransfer;
  const basePriceRef = productDetails?.price ?? product?.price ?? productDetails?.priceRange.min ?? 0;

  if (selectedVariant) {
    if (selectedVariant.priceWithTransfer) {
      currentPriceWithTransfer = selectedVariant.priceWithTransfer;
    } else if (basePriceWithTransfer && basePriceRef > 0) {
      const ratio = basePriceWithTransfer / basePriceRef;
      currentPriceWithTransfer = selectedVariant.discountedPrice * ratio;
    }
  } else {
    currentPriceWithTransfer = basePriceWithTransfer;
  }

  const isInStock =
    productDetails?.fulfillmentType === "DIGITAL_ON_DEMAND"
      ? true
      : selectedVariant
        ? selectedVariant.stock > 0
        : (productDetails?.inStock ?? true);

  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const reviewCount = productDetails?.totalReviews ?? reviews.length;
  const rating = productDetails?.averageRating ?? 0;
  const isInWishlist = productDetails ? wishlistItems.some((item) => item.id === productDetails.id) : false;

  const productTags = useMemo(() => {
    if (!productDetails) return [];

    const tags = [
      productDetails.category,
      productDetails.brand,
      getFulfillmentLabel(productDetails.fulfillmentType),
      getProductTypeLabel(productDetails.productType),
      productDetails.isPresale ? "Preventa" : null,
    ];

    return Array.from(new Set(tags.filter(Boolean))) as string[];
  }, [productDetails]);

  const breadcrumbCategory = productDetails?.category || "Productos";

  const tabs = [
    { id: "description", title: "Descripcion" },
    { id: "specifications", title: "Especificaciones" },
    { id: "additional", title: "Informacion adicional" },
    { id: "reviews", title: "Reseñas" },
  ];

  const hasFormatOption =
    !!productDetails?.hasVariants &&
    Object.keys(productDetails.options ?? {}).some((optionName) => optionName.toLowerCase() === "formato");

  const handleAttrChange = (key: string, value: string) => {
    const newAttrs = { ...selectedAttrs, [key]: value };
    setSelectedAttrs(newAttrs);

    const variant = productDetails?.variants.find((item) =>
      Object.entries(newAttrs).every(([attrKey, attrValue]) => item.attrs[attrKey] === attrValue)
    );

    if (variant) {
      setSelectedVariantId(variant.id);
      return;
    }

    const partialMatch = productDetails?.variants.find((item) => item.attrs[key] === value);
    if (partialMatch) {
      setSelectedVariantId(partialMatch.id);
      setSelectedAttrs(partialMatch.attrs);
    }
  };

  const handlePreviewSlider = () => {
    const basePayload = productDetails ?? product;
    if (basePayload) {
      dispatch(
        updateproductDetails({
          ...basePayload,
          images: currentImages,
          imgs: { ...(basePayload as StoredProduct).imgs, urls: currentImages },
        } as never)
      );
    }
    openPreviewModal();
  };

  const handleSubmitReview = async (request: ReviewRequest) => {
    try {
      if (myReview) {
        const updated = await reviewService.updateReview(myReview.id, request);
        setMyReview(updated);
        setIsEditingReview(false);
        toast.success("Review actualizada exitosamente");
      } else {
        const created = await reviewService.createReview(request);
        setMyReview(created);
        toast.success("Review publicada exitosamente");
      }

      const reviewsData = await reviewService.getReviewsByProduct(product?.id as number);
      setReviews(reviewsData);
    } catch (submitError) {
      console.error("Error submitting review:", submitError);
      toast.error("Error al publicar la review");
    }
  };

  const handleEditReview = () => {
    setIsEditingReview(true);
    setActiveTab("reviews");
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("¿Estas seguro de eliminar tu review?")) return;

    try {
      await reviewService.deleteReview(reviewId);
      setMyReview(null);
      toast.success("Review eliminada");

      const reviewsData = await reviewService.getReviewsByProduct(product?.id as number);
      setReviews(reviewsData);
    } catch (deleteError) {
      console.error("Error deleting review:", deleteError);
      toast.error("Error al eliminar la review");
    }
  };

  const handleAddToCart = async () => {
    if (!productDetails?.id) return;

    try {
      await addItem({
        productId: productDetails.id,
        variantId: productDetails.hasVariants && selectedVariantId ? selectedVariantId : undefined,
        quantity,
      });
    } catch (cartError) {
      console.error("Error adding to cart:", cartError);
      toast.error("No se pudo agregar al carrito");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesion para usar la wishlist");
      return;
    }

    if (!productDetails) return;

    const result = await dispatch(toggleWishlist(productDetails as never));
    const products = result.payload as { id: number }[] | undefined;

    if (products) {
      const isNowInWishlist = products.some((item) => item.id === productDetails.id);
      toast(isNowInWishlist ? "Anadido a tu wishlist" : "Quitado de tu wishlist");

      if (isNowInWishlist) {
        pixel.event("AddToWishlist", {
          content_name: productDetails.title,
          content_ids: [productDetails.id],
          content_type: "product",
          value: productDetails.discountedPrice || productDetails.price || productDetails.priceRange.minDiscounted,
          currency: "USD",
        });
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: productDetails?.title || "Producto",
      text: "Mira este producto",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado");
      }
    } catch (shareError) {
      if ((shareError as Error)?.name !== "AbortError") {
        console.error("Error sharing product:", shareError);
        toast.error("No se pudo compartir el producto");
      }
    }
  };

  const nextImage = () => {
    if (currentImages.length <= 1) return;
    setSelectedImage((current) => (current + 1) % currentImages.length);
  };

  const prevImage = () => {
    if (currentImages.length <= 1) return;
    setSelectedImage((current) => (current - 1 + currentImages.length) % currentImages.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Cargando detalles del producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-base font-medium text-destructive">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!productDetails && !product?.id) {
    return <div className="py-24 text-center text-muted-foreground">Por favor selecciona un producto.</div>;
  }

  return (
    <>
      <div className="hidden sm:block">
        <Breadcrumb
          title={productDetails?.title || "Detalle del Producto"}
          pages={[
            { label: "Productos", href: "/productos" },
            breadcrumbCategory,
          ]}
        />
      </div>

      <div className="mx-auto max-w-7xl px-3 pb-4 pt-36 sm:px-6 sm:py-6 lg:px-8">
        <nav className="mb-4 hidden flex-wrap items-center gap-2 text-sm text-muted-foreground sm:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/productos" className="transition-colors hover:text-foreground">
            Productos
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="max-w-[220px] truncate">{breadcrumbCategory}</span>
        </nav>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:rounded-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="relative bg-gray-1 lg:p-8">
              <div className="relative lg:flex lg:gap-4">
                <div className="hidden lg:flex lg:max-h-[520px] lg:flex-col lg:gap-3 lg:overflow-y-auto lg:pb-1">
                  {currentImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all duration-200 lg:h-20 lg:w-20",
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <CloudinaryImage
                        src={image}
                        alt={`${productDetails?.title || "Producto"} - imagen ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>

                <div className="relative min-w-0 flex-1">
                  {hasDiscount && (
                    <div className="absolute left-0 top-3 z-20 sm:top-4 lg:-left-2">
                      <span className="rounded-r-full bg-red px-3 py-1 text-xs font-bold text-white shadow-lg sm:px-4 sm:py-1.5 sm:text-sm">
                        {discountPercent}% OFF
                      </span>
                    </div>
                  )}

                  <div className="relative aspect-square w-full overflow-hidden bg-white sm:aspect-[4/5] lg:rounded-xl lg:shadow-sm">
                    <button
                      onClick={handlePreviewSlider}
                      className="absolute right-3 top-3 z-10 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-background"
                    >
                      Ampliar
                    </button>
                    <CloudinaryImage
                      src={currentImages[selectedImage] || "/placeholder.png"}
                      alt={productDetails?.title || "Producto"}
                      width={700}
                      height={900}
                      className="absolute inset-0 h-full w-full object-contain p-6 sm:p-8 lg:p-4"
                    />
                  </div>

                  {currentImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all active:scale-95 sm:hidden"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-5 w-5 text-foreground" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all active:scale-95 sm:hidden"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight className="h-5 w-5 text-foreground" />
                      </button>
                    </>
                  )}

                  {currentImages.length > 1 && (
                    <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5 sm:hidden">
                      {currentImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "h-2 rounded-full transition-all",
                            selectedImage === index ? "w-6 bg-primary" : "w-2 bg-black/20"
                          )}
                          aria-label={`Ir a imagen ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden items-center justify-center gap-2 border-t border-border/50 bg-white/50 p-3 sm:flex lg:hidden">
                {currentImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-14 w-14 overflow-hidden rounded-lg border-2 bg-white transition-all duration-200",
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <CloudinaryImage
                      src={image}
                      alt={`${productDetails?.title || "Producto"} - imagen ${index + 1}`}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col p-4 sm:p-6 lg:p-8">
              {productTags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
                  {productTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:px-3 sm:py-1 sm:text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {productDetails?.title}
              </h1>

              {productDetails?.isPresale && (
                <div className="mt-4 rounded-xl border border-yellow-light-1 bg-yellow-light-4 p-4 text-sm text-yellow-dark-2">
                  <span className="block font-semibold uppercase tracking-wide">Reserva disponible</span>
                  <span className="mt-1 block">
                    Lanzamiento:{" "}
                    {productDetails.releaseDate
                      ? new Date(productDetails.releaseDate).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Fecha a confirmar"}
                  </span>
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 sm:mt-3 sm:gap-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const filled = rating >= index + 1;
                      const partial = !filled && rating > index && rating < index + 1;

                      return (
                        <Star
                          key={index}
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4",
                            filled || partial
                              ? "fill-yellow text-yellow"
                              : "fill-neutral-200 text-neutral-200"
                          )}
                          style={partial ? { fillOpacity: rating - index } : undefined}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-muted-foreground sm:text-sm">({reviewCount})</span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    productDetails?.isPresale ? "text-yellow-dark-2" : isInStock ? "text-green" : "text-red"
                  )}
                >
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs font-medium sm:text-sm">
                    {productDetails?.isPresale
                      ? "Preventa"
                      : isInStock
                        ? "Disponible"
                        : "Sin stock"}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-muted/50 p-3 sm:mt-6 sm:rounded-xl sm:p-4">
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl font-bold text-foreground sm:text-3xl">{formatCurrency(currentPrice)}</span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through sm:text-lg">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                </div>

                {currentPriceWithTransfer && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:mt-2">
                    <span className="text-xl font-bold text-green sm:text-2xl">
                      {formatCurrency(currentPriceWithTransfer)}
                    </span>
                    <span className="rounded-full bg-green-light-6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-dark sm:px-2.5 sm:py-1 sm:text-xs">
                      Transferencia
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2 text-center sm:gap-1.5 sm:p-3">
                  <Truck className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  <span className="text-[9px] leading-tight text-muted-foreground sm:text-xs">Envio gratis</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2 text-center sm:gap-1.5 sm:p-3">
                  <ShieldCheck className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  <span className="text-[9px] leading-tight text-muted-foreground sm:text-xs">Garantia</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2 text-center sm:gap-1.5 sm:p-3">
                  <RotateCcw className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  <span className="text-[9px] leading-tight text-muted-foreground sm:text-xs">Devoluciones</span>
                </div>
              </div>

              <div className="my-4 h-px bg-border sm:my-6" />

              {productDetails?.hasVariants && Object.keys(productDetails.options).length > 0 && (
                <div className="mb-6 space-y-5">
                  {Object.entries(productDetails.options).map(([optionName, values]) => (
                    <div key={optionName} className="mb-4 sm:mb-6">
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:text-xs">
                        {optionName}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => {
                          const isSelected = selectedAttrs[optionName] === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleAttrChange(optionName, value)}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background hover:border-primary/40 hover:bg-muted"
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
              )}

              {!hasFormatOption && (
                <div className="mb-4 sm:mb-6">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:text-xs">
                    Formato
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground sm:px-4 sm:py-2.5 sm:text-sm">
                      {selectedVariant
                        ? Object.values(selectedVariant.attrs).map((value) => formatDisplayValue(value)).join(" / ")
                        : getFulfillmentLabel(productDetails?.fulfillmentType)}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-auto space-y-3 sm:space-y-0">
                <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted sm:h-12 sm:w-12"
                      aria-label="Restar cantidad"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium sm:w-12">{quantity}</span>
                    <button
                      onClick={() => {
                        const isDigital = productDetails?.fulfillmentType === "DIGITAL_ON_DEMAND";
                        const max = isDigital ? 9999 : selectedVariant?.stock ?? productDetails?.stockTotal ?? 9999;
                        setQuantity((current) => Math.min(current + 1, max));
                      }}
                      className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted sm:h-12 sm:w-12"
                      aria-label="Sumar cantidad"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className="hidden flex-1 rounded-lg text-base sm:flex"
                    disabled={!isInStock || quantity === 0}
                    onClick={handleAddToCart}
                  >
                    {productDetails?.isPresale
                      ? "Reservar ahora"
                      : isInStock
                        ? "Agregar al carrito"
                        : "Sin stock"}
                  </Button>

                  <div className="flex gap-2 sm:order-last">
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn("h-10 w-10 rounded-lg sm:h-12 sm:w-12", isInWishlist && "border-red-light-4 bg-red-light-6")}
                      onClick={handleToggleWishlist}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-colors sm:h-5 sm:w-5",
                          isInWishlist ? "fill-red text-red" : "text-muted-foreground"
                        )}
                      />
                    </Button>

                    <Button size="icon" variant="outline" className="h-10 w-10 rounded-lg sm:h-12 sm:w-12" onClick={handleShare}>
                      <Share2 className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-lg text-sm sm:hidden"
                  disabled={!isInStock || quantity === 0}
                  onClick={handleAddToCart}
                >
                  {productDetails?.isPresale
                    ? "Reservar ahora"
                    : isInStock
                      ? "Agregar al carrito"
                      : "Sin stock"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {productDetails?.description && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:mt-8 sm:rounded-2xl sm:p-6 lg:p-8">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">Descripcion</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
              {productDetails.description}
            </p>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              <div>
                {productDetails?.description ? (
                  <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
                    {productDetails.description}
                  </div>
                ) : (
                  <p className="italic text-muted-foreground">No hay descripcion disponible para este producto.</p>
                )}

                {productDetails?.productType === "DLC" && productDetails.parentGameId && productDetails.parentGameName && (
                  <div className="mt-6 rounded-xl border border-blue-light-4 bg-blue-light-5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue">Juego base requerido</p>
                    <p className="mt-2 text-sm text-dark">
                      Este DLC corresponde a{" "}
                      <Link
                        href={generateProductUrl(productDetails.parentGameId, productDetails.parentGameName)}
                        className="font-semibold text-blue hover:underline"
                      >
                        {productDetails.parentGameName}
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {productDetails?.productType === "GAME" && productDetails.dlcs.length > 0 && (
                  <div className="mt-6 rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">DLCs disponibles</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {productDetails.dlcs.map((dlc) => (
                        <Link
                          key={dlc.id}
                          href={generateProductUrl(dlc.id, dlc.title)}
                          className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-1">
                            <CloudinaryImage
                              src={dlc.image || "/placeholder.png"}
                              alt={dlc.title}
                              width={64}
                              height={64}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-foreground">{dlc.title}</p>
                            <p className="mt-1 text-sm font-semibold text-primary">
                              {formatCurrency(dlc.discountedPrice ?? dlc.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-5">
                <div>
                  <h3 className="font-medium text-foreground">Tipo</h3>
                  <p className="text-sm text-muted-foreground">{getProductTypeLabel(productDetails?.productType) || "No especificado"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Marca</h3>
                  <p className="text-sm text-muted-foreground">{productDetails?.brand || "No especificada"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Categoria</h3>
                  <p className="text-sm text-muted-foreground">{productDetails?.category || "No especificada"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">SKU</h3>
                  <p className="text-sm text-muted-foreground">{selectedVariant?.sku || productDetails?.sku || "No especificado"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Entrega</h3>
                  <p className="text-sm text-muted-foreground">{getFulfillmentLabel(productDetails?.fulfillmentType)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="mt-6 rounded-xl border border-border">
              {productDetails?.specifications && Object.keys(productDetails.specifications).length > 0 ? (
                Object.entries(productDetails.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid gap-2 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-2"
                  >
                    <p className="text-sm font-medium text-muted-foreground">{key}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center italic text-muted-foreground">
                  No hay especificaciones tecnicas detalladas.
                </div>
              )}
            </div>
          )}

          {activeTab === "additional" && (
            <div className="mt-6 rounded-xl border border-border">
              {[
                ["Tipo", getProductTypeLabel(productDetails?.productType) || "No especificado"],
                ["Marca", productDetails?.brand || "No especificada"],
                ["Categoria", productDetails?.category || "No especificada"],
                ["SKU", selectedVariant?.sku || productDetails?.sku || "No especificado"],
                [
                  "Stock total",
                  productDetails?.fulfillmentType === "DIGITAL_ON_DEMAND"
                    ? "Ilimitado (Digital)"
                    : `${productDetails?.stockTotal || 0} unidades`,
                ],
                ["Tipo de entrega", getFulfillmentLabel(productDetails?.fulfillmentType)],
                ...(productDetails?.productType === "DLC" && productDetails.parentGameName
                  ? [["Juego base", productDetails.parentGameName]]
                  : []),
                ...(productDetails?.productType === "GAME" && productDetails.dlcs.length > 0
                  ? [["DLCs", `${productDetails.dlcs.length} disponibles`]]
                  : []),
                ...(productDetails?.hasVariants ? [["Variantes disponibles", `${productDetails.variants.length} variantes`]] : []),
                ...(productDetails?.priceRange
                  ? [[
                      "Rango de precios",
                      `${formatCurrency(productDetails.priceRange.minDiscounted)} - ${formatCurrency(productDetails.priceRange.maxDiscounted)}`,
                    ]]
                  : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-2"
                >
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="mt-6">
              <ReviewsList
                reviews={reviews}
                averageRating={productDetails?.averageRating ?? null}
                totalReviews={productDetails?.totalReviews ?? 0}
                currentUserId={currentUserId}
                onEditReview={handleEditReview}
                onDeleteReview={handleDeleteReview}
              />

              {currentUserId ? (
                <ReviewForm
                  productId={product?.id as number}
                  existingReview={isEditingReview ? myReview : null}
                  onSubmit={handleSubmitReview}
                  onCancel={() => setIsEditingReview(false)}
                />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Debes iniciar sesion para escribir una review.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <RecentlyViewdItems />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
