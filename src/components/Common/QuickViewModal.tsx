"use client";
import React, { useEffect, useMemo, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addCartItem } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import {
  productDetailsPublicService,
  type NormalizedProduct,
  type NormalizedVariant,
} from "@/services/productDetailsService";

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });


const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const dispatch = useDispatch<AppDispatch>();

  // Producto “light” (del listado) — trae price/discountedPrice/imgs
  const product = useAppSelector((state) => state.quickViewReducer.value as {
    id: number;
    title: string;
    reviews: number;
    price: number;
    discountedPrice: number;
    imgs?: { thumbnails: string[]; previews: string[] };
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
          reviews: p?.reviews ?? 0,
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
          reviews: p?.reviews ?? 0,
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
      reviews: p.reviews ?? 0,
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

    // (opcional) guard extra: si requiere variante y no está elegida, no intentes postear
    if (details?.hasVariants && !variantId) {
      // toast.warn?.("Elegí una variante antes de agregar");
      return;
    }

    const action = await dispatch(
      addCartItem({
        productId,
        variantId,         // solo viaja si existe
        quantity,          // usa el estado actual
      })
    );

    // feedback opcional
    // if (addCartItem.fulfilled.match(action)) toast.success("Producto agregado");
    // else if (!((action.payload as any)?.data?.code === "NEEDS_VARIANT")) toast.error((action.payload as any)?.message ?? "Error");
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

  const inStock = variantStock !== undefined
    ? variantStock > 0
    : details?.inStock ?? true;

  return (
    <div
      className={`${
        isModalOpen ? "z-99999" : "hidden"
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
            <svg className="fill-current" width="26" height="26" viewBox="0 0 26 26">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
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
                      className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${
                        activePreview === key && "border-2 border-blue"
                      }`}
                    >
                      <Image
                        src={img || ""}
                        alt="thumbnail"
                        width={61}
                        height={61}
                        className="aspect-square"
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
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                        <path d="M9.11 1.15h.05c.38 0 .69.31.69.69s-.31.69-.69.69c-1.75 0-2.99.00-3.93.13-.92.12-1.46.35-1.85.74-.39.39-.62.93-.74 1.85-.13.94-.13 2.18-.13 3.93 0 .38-.31.69-.69.69s-.69-.31-.69-.69V9.11c0-1.68 0-3.01.14-4.06.14-1.07.45-1.95 1.14-2.64.69-.69 1.58-1 2.64-1.14C7.43 1 8.76 1 10.45 1.15z" />
                      </svg>
                    </button>

                    <Image
                      src={galleryImages[activePreview] || ""}
                      alt="products-details"
                      width={400}
                      height={400}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== INFO ===== */}
            <div className="max-w-[445px] w-full">
              <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-green mb-6.5">
                SALE 20% OFF
              </span>

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

              <h3 className="font-semibold text-xl xl:text-heading-5 text-dark mb-4">
                {title}
              </h3>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                    fill={inStock ? "#22AD5C" : "#f43f5e"}
                  />
                  <path
                    d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                    fill={inStock ? "#22AD5C" : "#f43f5e"}
                  />
                </svg>
                <span className="font-medium text-dark">
                  {inStock
                    ? `In Stock${typeof variantStock === "number" ? ` (${variantStock})` : ""}`
                    : "Out of Stock"}
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
                      const sfx = v.stock > 0 ? "" : " — (Sin stock)";
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
                  <h4 className="font-semibold text-lg text-dark mb-3.5">Price</h4>

                  {/* Con variante seleccionada: mostrar precio de la variante */}
                  {details?.hasVariants ? (
                    selectedVariant ? (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-dark text-xl xl:text-heading-4">
                          {currency.format(selectedVariant.discountedPrice)}
                        </span>
                        {selectedVariant.discountedPrice !== selectedVariant.price && (
                          <span className="font-medium text-dark-4 text-lg xl:text-2xl line-through">
                            {currency.format(selectedVariant.price)}
                          </span>
                        )}
                      </span>
                    ) : (
                      // Si no hay variante (raro), mostrar rango
                      <span className="font-semibold text-dark text-xl xl:text-heading-4">
                        {currency.format(details.priceRange.minDiscounted)} – {currency.format(details.priceRange.maxDiscounted)}
                      </span>
                    )
                  ) : details ? (
                    // Sin variantes: usar price del detalle
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-dark text-xl xl:text-heading-4">
                        {currency.format(details.discountedPrice ?? details.price!)}
                      </span>
                      {(details.discountedPrice ?? details.price) !== details.price && (
                        <span className="font-medium text-dark-4 text-lg xl:text-2xl line-through">
                          {currency.format(details.price!)}
                        </span>
                      )}
                    </span>
                  ) : (
                    // Fallback del “light”
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-dark text-xl xl:text-heading-4">
                        {currency.format(product?.discountedPrice ?? product?.price ?? 0)}
                      </span>
                      {product && product.discountedPrice !== product.price && (
                        <span className="font-medium text-dark-4 text-lg xl:text-2xl line-through">
                          {currency.format(product.price)}
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <h4 className="font-semibold text-lg text-dark mb-3.5">Quantity</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      aria-label="button for remove product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
                    >
                      <svg className="fill-current" width="16" height="2" viewBox="0 0 16 2">
                        <path d="M0 0.98C0 0.44 0.44 0 0.98 0H15.02C15.56 0 16 0.44 16 0.98C16 1.52 15.56 1.96 15.02 1.96H0.98C0.44 1.96 0 1.52 0 0.98Z" />
                      </svg>
                    </button>

                    <span className="flex items-center justify-center w-20 h-10 rounded-[5px] border border-gray-4 bg-white font-medium text-dark">
                      {quantity}
                    </span>

                    <button
                      onClick={() => {
                        const max = variantStock ?? 9999;
                        setQuantity(q => Math.min(q + 1, max));
                      }}
                      aria-label="button for add product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
                    >
                      <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8.09 0C8.63 0 9.07 0.44 9.07 0.98V15.02C9.07 15.56 8.63 16 8.09 16C7.55 16 7.11 15.56 7.11 15.02V0.98C7.11 0.44 7.55 0 8.09 0Z" />
                        <path d="M0 7.91C0 7.37 0.44 6.93 0.98 6.93H15.02C15.56 6.93 16 7.37 16 7.91C16 8.45 15.56 8.89 15.02 8.89H0.98C0.44 8.89 0 8.45 0 7.91Z" />
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
                  Add to Cart
                </button>

                <button className="inline-flex items-center gap-2 font-medium text-white bg-dark py-3 px-6 rounded-md ease-out duration-200 hover:bg-opacity-95 ">
                  {/* heart icon */}
                  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.687 3.687C3.304 4.319 2.292 5.822 2.292 7.614C2.292 9.445 3.041 10.857 4.115 12.067C5.001 13.064 6.072 13.89 7.118 14.696C7.366 14.887 7.613 15.077 7.855 15.268C8.293 15.614 8.684 15.917 9.061 16.137C9.438 16.358 9.742 16.458 10 16.458C10.258 16.458 10.562 16.358 10.939 16.137C11.316 15.917 11.707 15.614 12.145 15.268C12.387 15.077 12.634 14.887 12.882 14.696C13.928 13.89 15 13.064 15.885 12.067C16.959 10.857 17.708 9.445 17.708 7.614C17.708 5.822 16.695 4.319 15.313 3.687C13.97 3.073 12.165 3.236 10.45 5.017C10.333 5.14 10.17 5.209 10 5.209C9.83 5.209 9.668 5.14 9.55 5.017C7.835 3.236 6.03 3.073 4.687 3.687Z"
                    />
                  </svg>
                  Add to Wishlist
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
    </div>
  );
};

export default QuickViewModal;
