"use client";
import React, { use, useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { useCart } from "@/hooks/useCart";
import { productDetailsPublicService, type NormalizedProduct, type NormalizedVariant } from "@/services/productDetailsService";
import { updateproductDetails } from "@/redux/features/product-details";
import { toggleWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import toast from "react-hot-toast";
import { reviewService } from "@/services/reviewService";
import { ReviewResponse, ReviewRequest } from "@/types/review";
import { ReviewsList } from "./ReviewsList";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { StarRating } from "@/components/Common/StarRating";
import { PriceDisplay } from "@/components/Common/PriceDisplay";

interface ShopDetailsProps {
  productId?: string;
}

const ShopDetails = ({ productId }: ShopDetailsProps) => {
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");

  // Dynamic variant system
  const [productDetails, setProductDetails] = useState<NormalizedProduct | null>(null);

  // Wishlist state
  const wishlistItems = useAppSelector((s) => s.wishlistReducer.items);
  const isInWishlist = productDetails ? wishlistItems.some((p) => p.id === productDetails.id) : false;

  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?.id;

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { addItem } = useCart();

  const tabs = [
    {
      id: "tabOne",
      title: "Descripción",
    },
    {
      id: "tabTwo",
      title: "Información Adicional",
    },
    {
      id: "tabThree",
      title: "Reseñas",
    },
  ];

  const alreadyExist = localStorage.getItem("productDetails");
  const productFromStorage = useAppSelector(
    (state) => state.productDetailsReducer.value
  );

  // Use productId from URL if available, otherwise use stored product
  const product = productId
    ? { id: parseInt(productId, 10) }
    : (alreadyExist ? JSON.parse(alreadyExist) : productFromStorage);

  // Fetch full product details with variants
  useEffect(() => {
    if (!product?.id) return;

    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const details = await productDetailsPublicService.getNormalized(product.id);
        setProductDetails(details);


        // Set default variant if product has variants
        if (details.hasVariants && details.variants.length > 0) {
          const defaultVariant = details.variants.find(v => v.stock > 0) ?? details.variants[0];
          setSelectedVariantId(defaultVariant?.id ?? null);
        }

        // Update Redux store with full details
        dispatch(updateproductDetails(details));
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product?.id, dispatch]);

  // Fetch reviews when product loads
  useEffect(() => {
    if (!product?.id) {
      console.log("⚠️ No product ID available");
      return;
    }

    const fetchReviews = async () => {
      try {
        const reviewsData = await reviewService.getReviewsByProduct(product.id);
        setReviews(reviewsData);
      } catch (err) {
        console.error('❌ Error fetching reviews:', err);
        console.error('Error details:', err?.response?.data);
      }
    };

    fetchReviews();
  }, [product?.id]);

  // Fetch user's review if authenticated
  useEffect(() => {
    if (!product?.id) return;
    const fetchMyReview = async () => {
      try {
        const myReviewData = await reviewService.getMyReviewForProduct(product.id);
        setMyReview(myReviewData);
      } catch (err) {
        console.error('Error fetching my review:', err);
      }
    };
    // Solo intentar si el usuario está autenticado
    // Puedes verificar el token o el estado de autenticación aquí
    fetchMyReview();
  }, [product?.id]);

  // Helper functions
  const selectedVariant: NormalizedVariant | null = productDetails?.hasVariants
    ? productDetails.variants.find(v => v.id === selectedVariantId) ?? null
    : null;

  const currentImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : productDetails?.images ?? product?.imgs?.previews ?? [];

  const currentPrice = selectedVariant
    ? selectedVariant.discountedPrice
    : productDetails?.discountedPrice ?? product?.discountedPrice ?? 0;

  const originalPrice = selectedVariant
    ? selectedVariant.price
    : productDetails?.price ?? product?.price ?? 0;

  // Lógica de precio con transferencia:
  // Usar estrictamente datos del backend.

  let currentPriceWithTransfer: number | undefined;

  // 1. Intentar obtener el precio transfer base del objeto de detalles
  const basePriceWithTransfer = productDetails?.priceWithTransfer ?? product?.priceWithTransfer;

  // 2. Obtener un precio de referencia para calcular el ratio (si es necesario)
  // Si es producto variable, 'price' puede ser null, usamos el rango de precios.
  const basePriceRef = productDetails?.price
    ?? product?.price
    ?? productDetails?.priceRange?.min
    ?? 0;

  if (selectedVariant) {
    // A) Si la variante tiene su propio precio transfer explícito, usarlo (Ideal)
    if (selectedVariant.priceWithTransfer) {
      currentPriceWithTransfer = selectedVariant.priceWithTransfer;
    }
    // B) Si no, calcularlo usando el ratio del producto padre (Fallback dinámico)
    else if (basePriceWithTransfer && basePriceRef > 0) {
      const ratio = basePriceWithTransfer / basePriceRef;
      currentPriceWithTransfer = selectedVariant.discountedPrice * ratio;
    }
  } else {
    // C) Sin variante seleccionada: usar el precio base directo
    currentPriceWithTransfer = basePriceWithTransfer;
  }

  // Debug para verificar que está tomando los datos reales
  console.log('🔍 Transfer Price Logic:', {
    basePriceWithTransfer,
    basePriceRef,
    variantTransfer: selectedVariant?.priceWithTransfer,
    calculated: currentPriceWithTransfer
  });

  // Usar la misma lógica que el productDetailsService
  const isInStock = productDetails?.inStock ?? true;

  const handlePreviewSlider = () => {
    // Pass the full product details to the preview modal
    dispatch(updateproductDetails(productDetails ?? product));
    openPreviewModal();
  };

  // Review handlers
  const handleSubmitReview = async (request: ReviewRequest) => {
    try {
      if (myReview) {
        // Update existing review
        const updated = await reviewService.updateReview(myReview.id, request);
        setMyReview(updated);
        setIsEditingReview(false);
        toast.success("Review actualizada exitosamente");

        // Refresh reviews list
        const reviewsData = await reviewService.getReviewsByProduct(product.id);
        setReviews(reviewsData);
      } else {
        // Create new review
        const created = await reviewService.createReview(request);
        setMyReview(created);
        toast.success("Review publicada exitosamente");

        // Refresh reviews list
        const reviewsData = await reviewService.getReviewsByProduct(product.id);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error al publicar la review");
    }
  };

  const handleEditReview = (review: ReviewResponse) => {
    setIsEditingReview(true);
    setActiveTab("tabThree"); // Switch to reviews tab
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("¿Estás seguro de eliminar tu review?")) return;

    try {
      await reviewService.deleteReview(reviewId);
      setMyReview(null);
      toast.success("Review eliminada");

      // Refresh reviews list
      const reviewsData = await reviewService.getReviewsByProduct(product.id);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error deleting review:", error);
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
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };
  console.log(reviews);
  return (
    <>
      <Breadcrumb title={"Detalle del Producto"} pages={["detalle del producto"]} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
            <p>Cargando detalles del producto...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue text-white rounded hover:bg-blue-dark"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !productDetails && !product ? (
        "Por favor selecciona un producto"
      ) : (
        <>
          <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
                <div className="lg:max-w-[570px] w-full">
                  <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                    <div>
                      <button
                        onClick={handlePreviewSlider}
                        aria-label="button for zoom"
                        className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                      >
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

                      <Image
                        src={currentImages[previewImg] || "/placeholder.png"}
                        alt="products-details"
                        width={400}
                        height={400}
                      />
                    </div>
                  </div>

                  {/* ?  &apos;border-blue &apos; :  &apos;border-transparent&apos; */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                    {currentImages.map((item, key) => (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${key === previewImg
                          ? "border-blue"
                          : "border-transparent"
                          }`}
                      >
                        <Image
                          width={50}
                          height={50}
                          src={item}
                          alt="thumbnail"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* <!-- product content --> */}
                <div className="max-w-[539px] w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                      {productDetails?.title || product?.title}
                    </h2>

                    {currentPrice < originalPrice && (
                      <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                        {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      <StarRating
                        rating={productDetails?.averageRating ?? 0}
                        totalReviews={reviews.length}
                        size={18}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
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
                            fill={isInStock ? "#22AD5C" : "#FF6B6B"}
                          />
                          <path
                            d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                            fill={isInStock ? "#22AD5C" : "#FF6B6B"}
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_375_9221">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>

                      <span className={isInStock ? "text-green" : "text-red"}>
                        {productDetails?.fulfillmentType === 'DIGITAL_ON_DEMAND'
                          ? "Disponible (Digital)"
                          : isInStock
                            ? "En Stock"
                            : "Sin Stock"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mb-4.5">
                    <PriceDisplay
                      price={originalPrice}
                      discountedPrice={currentPrice}
                      priceWithTransfer={currentPriceWithTransfer}
                      size="xl"
                    />
                  </div>

                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z"
                          fill="#3C50E0"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z"
                          fill="#3C50E0"
                        />
                      </svg>
                      Envío gratuito disponible
                    </li>


                  </ul>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                      {/* Dynamic Variant Selector */}
                      {productDetails?.hasVariants && productDetails.variants.length > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="min-w-[65px]">
                            <h4 className="font-medium text-dark">Variantes:</h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                            {productDetails.variants.map((variant) => {
                              const isSelected = selectedVariantId === variant.id;
                              const isOutOfStock = productDetails?.fulfillmentType !== 'DIGITAL_ON_DEMAND' && !productDetails.inStock;

                              return (
                                <label
                                  key={variant.id}
                                  htmlFor={`variant-${variant.id}`}
                                  className={`flex cursor-pointer select-none items-center p-2 rounded border ${isSelected
                                    ? "border-blue bg-blue/10"
                                    : "border-gray-3 hover:border-gray-4"
                                    } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  <div className="relative">
                                    <input
                                      type="radio"
                                      name="variant"
                                      id={`variant-${variant.id}`}
                                      className="sr-only"
                                      checked={isSelected}
                                      onChange={() => setSelectedVariantId(variant.id)}
                                      disabled={isOutOfStock}
                                    />
                                    <div
                                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${isSelected
                                        ? "border-blue bg-blue"
                                        : "border-gray-4"
                                        }`}
                                    >
                                      <span
                                        className={
                                          isSelected
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }
                                      >
                                        <svg
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            x="4"
                                            y="4.00006"
                                            width="16"
                                            height="16"
                                            rx="4"
                                            fill="#3C50E0"
                                          />
                                          <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M16.3103 9.25104C16.471 9.41178 16.5612 9.62978 16.5612 9.85707C16.5612 10.0844 16.471 10.3024 16.3103 10.4631L12.0243 14.7491C11.8635 14.9098 11.6455 15.0001 11.4182 15.0001C11.191 15.0001 10.973 14.9098 10.8122 14.7491L8.24062 12.1775C8.08448 12.0158 7.99808 11.7993 8.00003 11.5745C8.00199 11.3498 8.09214 11.1348 8.25107 10.9759C8.41 10.8169 8.62499 10.7268 8.84975 10.7248C9.0745 10.7229 9.29103 10.8093 9.4527 10.9654L11.4182 12.931L15.0982 9.25104C15.2589 9.09034 15.4769 9.00006 15.7042 9.00006C15.9315 9.00006 16.1495 9.09034 16.3103 9.25104Z"
                                            fill="white"
                                          />
                                        </svg>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {Object.entries(variant.attrs).map(([key, value]) => `${key}: ${value}`).join(", ") || `Variant ${variant.id}`}
                                    </span>
                                    <span className="text-xs text-gray-5">
                                      ${variant.discountedPrice.toFixed(2)}
                                      {variant.discountedPrice < variant.price && (
                                        <span className="line-through ml-1">${variant.price.toFixed(2)}</span>
                                      )}
                                      {isOutOfStock && <span className="text-red ml-1">(Sin Stock)</span>}
                                      {productDetails?.fulfillmentType === 'DIGITAL_ON_DEMAND' && <span className="text-green ml-1">(Digital)</span>}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4.5">
                      <div className="flex items-center rounded-md border border-gray-3">
                        <button
                          type="button"
                          aria-label="button for remove product"
                          className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z"
                              fill=""
                            />
                          </svg>
                        </button>

                        <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const isDigital = productDetails?.fulfillmentType === 'DIGITAL_ON_DEMAND';
                            const max = isDigital ? 9999 : (selectedVariant?.stock ?? productDetails?.stockTotal ?? 9999);
                            setQuantity(q => Math.min(q + 1, max));
                          }}
                          aria-label="button for add product"
                          className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z"
                              fill=""
                            />
                            <path
                              d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!isInStock || quantity === 0}
                        className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {productDetails?.fulfillmentType === 'DIGITAL_ON_DEMAND'
                          ? "Agregar"
                          : isInStock
                            ? "Agregar"
                            : "Sin Stock"
                        }
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast.error("Debes iniciar sesión para usar la wishlist");
                            return;
                          }
                          if (productDetails) {
                            const res = await dispatch(toggleWishlist(productDetails as any));
                            const products = res.payload as any[] | undefined;
                            if (products) {
                              const isIn = products.some((p) => p.id === productDetails.id);
                              toast(isIn ? "Añadido a tu wishlist" : "Quitado de tu wishlist");
                            }
                          }
                        }}
                        className={`flex items-center justify-center w-12 h-12 rounded-md border ease-out duration-200 ${isInWishlist
                          ? "bg-blue border-blue text-white hover:bg-blue-dark"
                          : "bg-white border-gray-3 text-dark hover:text-white hover:bg-dark hover:border-transparent"
                          }`}
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.62436 4.42423C3.96537 5.18256 2.75 6.98626 2.75 9.13713C2.75 11.3345 3.64922 13.0283 4.93829 14.4798C6.00072 15.6761 7.28684 16.6677 8.54113 17.6346C8.83904 17.8643 9.13515 18.0926 9.42605 18.3219C9.95208 18.7366 10.4213 19.1006 10.8736 19.3649C11.3261 19.6293 11.6904 19.75 12 19.75C12.3096 19.75 12.6739 19.6293 13.1264 19.3649C13.5787 19.1006 14.0479 18.7366 14.574 18.3219C14.8649 18.0926 15.161 17.8643 15.4589 17.6346C16.7132 16.6677 17.9993 15.6761 19.0617 14.4798C20.3508 13.0283 21.25 11.3345 21.25 9.13713C21.25 6.98626 20.0346 5.18256 18.3756 4.42423C16.7639 3.68751 14.5983 3.88261 12.5404 6.02077C12.399 6.16766 12.2039 6.25067 12 6.25067C11.7961 6.25067 11.601 6.16766 11.4596 6.02077C9.40166 3.88261 7.23607 3.68751 5.62436 4.42423ZM12 4.45885C9.68795 2.39027 7.09896 2.1009 5.00076 3.05999C2.78471 4.07296 1.25 6.42506 1.25 9.13713C1.25 11.8027 2.3605 13.8361 3.81672 15.4758C4.98287 16.789 6.41022 17.888 7.67083 18.8586C7.95659 19.0786 8.23378 19.2921 8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.66C10.6739 20.9855 11.3096 21.25 12 21.25C12.6904 21.25 13.3261 20.9855 13.8832 20.66C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999C15.7662 19.2921 16.0434 19.0786 16.3292 18.8586C17.5898 17.888 19.0171 16.789 20.1833 15.4758C21.6395 13.8361 22.75 11.8027 22.75 9.13713C22.75 6.42506 21.2153 4.07296 18.9992 3.05999C16.901 2.1009 14.3121 2.39027 12 4.45885Z"
                            fill=""
                          />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden bg-gray-2 py-20">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              {/* <!--== tab header start ==--> */}
              <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
                {tabs.map((item, key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(item.id)}
                    className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id
                      ? "text-blue before:w-full"
                      : "text-dark before:w-0"
                      }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              {/* <!--== tab header end ==--> */}

              {/* <!--== tab content start ==--> */}
              {/* <!-- tab content one start --> */}
              <div>
                <div
                  className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabOne" ? "flex" : "hidden"
                    }`}
                >
                  <div className="max-w-[670px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">
                      Especificaciones:
                    </h2>

                    {productDetails?.description ? (
                      <div className="whitespace-pre-line">
                        {productDetails.description}
                      </div>
                    ) : (
                      <p className="text-gray-5 italic">
                        No hay descripción disponible para este producto.
                      </p>
                    )}
                  </div>

                  <div className="max-w-[447px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">
                      Cuidado y Mantenimiento:
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-dark mb-2">Marca:</h3>
                        <p className="text-gray-6">{productDetails?.brand || 'No especificada'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-2">Categoría:</h3>
                        <p className="text-gray-6">{productDetails?.category || 'No especificada'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-2">SKU:</h3>
                        <p className="text-gray-6">{productDetails?.sku || 'No especificado'}</p>
                      </div>
                      {productDetails?.fulfillmentType && (
                        <div>
                          <h3 className="font-medium text-dark mb-2">Tipo de entrega:</h3>
                          <p className="text-gray-6">
                            {productDetails.fulfillmentType === 'PHYSICAL' && 'Producto físico'}
                            {productDetails.fulfillmentType === 'DIGITAL_ON_DEMAND' && 'Digital bajo demanda'}
                            {productDetails.fulfillmentType === 'DIGITAL_INSTANT' && 'Digital instantáneo'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- tab content one end --> */}

              {/* <!-- tab content two start --> */}
              <div>
                <div
                  className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10 ${activeTab === "tabTwo" ? "block" : "hidden"
                    }`}
                >
                  {/* Información del producto desde el backend */}
                  <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base text-dark">Marca</p>
                    </div>
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {productDetails?.brand || 'No especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base text-dark">Categoría</p>
                    </div>
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {productDetails?.category || 'No especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base text-dark">SKU</p>
                    </div>
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {productDetails?.sku || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base text-dark">Stock Total</p>
                    </div>
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {productDetails?.fulfillmentType === 'DIGITAL_ON_DEMAND'
                          ? "Ilimitado (Digital)"
                          : `${productDetails?.stockTotal || 0} unidades`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base text-dark">Tipo de Entrega</p>
                    </div>
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {productDetails?.fulfillmentType === 'PHYSICAL' && 'Producto físico'}
                        {productDetails?.fulfillmentType === 'DIGITAL_ON_DEMAND' && 'Digital bajo demanda'}
                        {productDetails?.fulfillmentType === 'DIGITAL_INSTANT' && 'Digital instantáneo'}
                        {!productDetails?.fulfillmentType && 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {productDetails?.hasVariants && (
                    <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                      <div className="max-w-[450px] min-w-[140px] w-full">
                        <p className="text-sm sm:text-base text-dark">Variantes Disponibles</p>
                      </div>
                      <div className="w-full">
                        <p className="text-sm sm:text-base text-dark">
                          {productDetails.variants.length} variantes
                        </p>
                      </div>
                    </div>
                  )}

                  {productDetails?.priceRange && (
                    <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                      <div className="max-w-[450px] min-w-[140px] w-full">
                        <p className="text-sm sm:text-base text-dark">Rango de Precios</p>
                      </div>
                      <div className="w-full">
                        <p className="text-sm sm:text-base text-dark">
                          ${productDetails.priceRange.minDiscounted.toFixed(2)} - ${productDetails.priceRange.maxDiscounted.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* <!-- tab content two end --> */}
              {/* tab content three - Reviews */}
              <div className={activeTab === "tabThree" ? "block" : "hidden"}>
                <div className="max-w-[900px] mx-auto">
                  <ReviewsList
                    reviews={reviews}
                    averageRating={productDetails?.averageRating ?? null}
                    totalReviews={productDetails?.totalReviews ?? 0}
                    currentUserId={currentUserId}
                    onEditReview={handleEditReview}
                    onDeleteReview={handleDeleteReview}
                  />
                  {/* Review Form - solo para usuarios autenticados */}
                  {currentUserId && (
                    <ReviewForm
                      productId={product?.id}
                      existingReview={isEditingReview ? myReview : null}
                      onSubmit={handleSubmitReview}
                      onCancel={() => setIsEditingReview(false)}
                    />
                  )}
                  {/* Mensaje para usuarios no autenticados */}
                  {!currentUserId && (
                    <div className="text-center py-8 text-dark-4">
                      <p>Debes iniciar sesión para escribir una review</p>
                    </div>
                  )}
                </div>
              </div>
              {/* tab content three end */}
            </div>
          </section>

          <RecentlyViewdItems />

          <Newsletter />
        </>
      )}
    </>
  );
};

export default ShopDetails;
