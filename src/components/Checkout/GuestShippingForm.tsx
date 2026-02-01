"use client";

import React, { useState, useEffect } from "react";
import { orderService, type OrderResponse } from "@/services/orderService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Props = {
    order?: OrderResponse | null;
    onSelected?: (data: any) => void;
};

// Schema for Guest Shipping
const guestShippingSchema = z.object({
    recipientName: z.string().min(1, "El nombre de destinatario es obligatorio"),
    phone: z.string().min(1, "El teléfono es obligatorio"),
    street: z.string().min(1, "La calle es obligatoria"),
    streetNumber: z.string().min(1, "La altura es obligatoria"),
    floor: z.string().optional(),
    apartmentNumber: z.string().optional(),
    city: z.string().min(1, "La ciudad es obligatoria"),
    state: z.string().min(1, "La provincia/estado es obligatoria"),
    postalCode: z.string().min(1, "El código postal es obligatorio"),
    country: z.string(),
});

type GuestShippingSchema = z.infer<typeof guestShippingSchema>;

/**
 * Formulario de shipping directo para GUESTS
 * No requiere autenticación, envía la dirección completa al PATCH
 */
const GuestShippingForm: React.FC<Props> = ({ order, onSelected }) => {
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isDirty }
    } = useForm<GuestShippingSchema>({
        resolver: zodResolver(guestShippingSchema),
        defaultValues: {
            recipientName: "",
            phone: "",
            street: "",
            streetNumber: "",
            floor: "",
            apartmentNumber: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Argentina",
        }
    });

    // Reset isSaved only when form becomes dirty again
    useEffect(() => {
        if (isSaved && isDirty) {
            setIsSaved(false);
        }
    }, [isDirty, isSaved]);

    const onSubmit = async (data: GuestShippingSchema) => {
        if (!order) {
            toast.error("No hay orden activa");
            return;
        }

        setErr(null);
        setSaving(true);

        try {
            // PATCH /api/orders/{orderNumber}/shipping-address con dirección completa
            if (!order?.orderNumber) {
                toast.error("No hay información de la orden");
                return;
            }
            await orderService.patchShippingAddress(order.orderNumber, {
                // NO enviamos shippingAddressId para guests
                recipientName: data.recipientName,
                phone: data.phone,
                street: data.street,
                streetNumber: data.streetNumber,
                floor: data.floor || undefined,
                apartmentNumber: data.apartmentNumber || undefined,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
            } as any);

            toast.success("Dirección de envío guardada ✓");
            reset(data); // Mark as pristine/saved
            setIsSaved(true);
            onSelected?.(data);
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "No se pudo guardar la dirección."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-9">
            <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
                Detalles de envío
            </h2>

            <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                {err && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
                        {err}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="recipientName" className="block text-sm text-dark mb-1">
                            Nombre del destinatario *
                        </label>
                        <input
                            type="text"
                            id="recipientName"
                            className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.recipientName ? "border-red-500" : "border-gray-4"}`}
                            {...register("recipientName")}
                            placeholder="Ej: Juan Pérez"
                        />
                        {errors.recipientName && <span className="text-red-500 text-xs">{errors.recipientName.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm text-dark mb-1">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.phone ? "border-red-500" : "border-gray-4"}`}
                            {...register("phone")}
                            placeholder="Ej: 11 1234-5678"
                        />
                        {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="street" className="block text-sm text-dark mb-1">
                                Calle *
                            </label>
                            <input
                                type="text"
                                id="street"
                                className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.street ? "border-red-500" : "border-gray-4"}`}
                                {...register("street")}
                            />
                            {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
                        </div>

                        <div>
                            <label htmlFor="streetNumber" className="block text-sm text-dark mb-1">
                                Número *
                            </label>
                            <input
                                type="text"
                                id="streetNumber"
                                className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.streetNumber ? "border-red-500" : "border-gray-4"}`}
                                {...register("streetNumber")}
                            />
                            {errors.streetNumber && <span className="text-red-500 text-xs">{errors.streetNumber.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="floor" className="block text-sm text-dark mb-1">
                                Piso (opcional)
                            </label>
                            <input
                                type="text"
                                id="floor"
                                className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                {...register("floor")}
                            />
                        </div>

                        <div>
                            <label htmlFor="apartmentNumber" className="block text-sm text-dark mb-1">
                                Depto (opcional)
                            </label>
                            <input
                                type="text"
                                id="apartmentNumber"
                                className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                {...register("apartmentNumber")}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm text-dark mb-1">
                            Ciudad *
                        </label>
                        <input
                            type="text"
                            id="city"
                            className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.city ? "border-red-500" : "border-gray-4"}`}
                            {...register("city")}
                        />
                        {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="state" className="block text-sm text-dark mb-1">
                                Provincia *
                            </label>
                            <input
                                type="text"
                                id="state"
                                className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.state ? "border-red-500" : "border-gray-4"}`}
                                {...register("state")}
                            />
                            {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
                        </div>

                        <div>
                            <label htmlFor="postalCode" className="block text-sm text-dark mb-1">
                                Código postal *
                            </label>
                            <input
                                type="text"
                                id="postalCode"
                                className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.postalCode ? "border-red-500" : "border-gray-4"}`}
                                {...register("postalCode")}
                            />
                            {errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode.message}</span>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm text-dark mb-1">
                            País *
                        </label>
                        <input
                            type="text"
                            id="country"
                            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-gray-2"
                            value="Argentina"
                            disabled
                        />
                    </div>

                    {isSaved ? (
                        <button
                            type="button"
                            disabled
                            className="w-full bg-green text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 mt-4 cursor-default"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white" fillOpacity="0.2" />
                                <path d="M16 11L11 16L8 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Guardado
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-dark transition-colors disabled:opacity-60 mt-4"
                        >
                            {saving ? "Guardando..." : "Guardar dirección"}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default GuestShippingForm;
