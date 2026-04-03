import React from "react";

interface PriceDisplayProps {
    price: number;
    discountedPrice: number;
    priceWithTransfer?: number;
    currency?: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price,
    discountedPrice,
    priceWithTransfer,
    currency = "ARS",
    className = "",
    size = "md",
}) => {
    const format = (amount: number) =>
        new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(amount);

    const hasDiscount = discountedPrice < price;
    const hasTransferPrice = priceWithTransfer !== undefined && priceWithTransfer !== null && priceWithTransfer > 0;

    // Sizes for main text
    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl xl:text-heading-4",
    };

    const mainTextClass = sizeClasses[size];
    const subTextClass = size === "xl" ? "text-lg" : "text-sm";

    const alignment = className.includes("items-") ? "" : "items-start";

    // Case 2: Promo general (Transfer + Discounted + Crossed Price)
    if (hasTransferPrice && hasDiscount) {
        return (
            <div className={`flex flex-col ${alignment} ${className}`}>
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-dark font-medium ${size === "xl" ? "text-lg" : "text-base"}`}>{format(discountedPrice)}</span>
                    <span className={`text-gray-400 line-through ${subTextClass}`}>{format(price)}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center items-start lg:gap-2">
                    <span className={`text-green font-bold ${mainTextClass} leading-none`}>
                        {format(priceWithTransfer!)}
                    </span>
                    <span className="text-[9px] bg-green/10 text-green px-1.5 py-0.5 rounded leading-none font-semibold uppercase tracking-wider mt-1 lg:mt-0">
                        Transferencia
                    </span>
                </div>
            </div>
        );
    }

    // Case 1: Solo transferencia (Transfer + Normal Price)
    if (hasTransferPrice && !hasDiscount) {
        return (
            <div className={`flex flex-col ${alignment} ${className}`}>
                <span className={`text-dark font-medium ${size === "xl" ? "text-lg" : "text-base"} mb-0.5`}>{format(price)}</span>
                <div className="flex flex-col lg:flex-row lg:items-center items-start lg:gap-2">
                    <span className={`text-green font-bold ${mainTextClass} leading-none`}>
                        {format(priceWithTransfer!)}
                    </span>
                    <span className="text-[9px] bg-green/10 text-green px-1.5 py-0.5 rounded leading-none font-semibold uppercase tracking-wider mt-1 lg:mt-0">
                        Transferencia
                    </span>
                </div>
            </div>
        );
    }

    // Case 3: Sin ninguna promo (o solo descuento regular si no hay transfer price)
    if (hasDiscount) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className={`text-dark font-medium ${mainTextClass}`}>{format(discountedPrice)}</span>
                <span className={`text-gray-400 line-through ${subTextClass}`}>{format(price)}</span>
            </div>
        );
    }

    // Regular price
    return (
        <span className={`text-dark font-medium ${mainTextClass} ${className}`}>
            {format(price)}
        </span>
    );
};
