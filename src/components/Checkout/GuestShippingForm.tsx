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
        formState: { errors, isDirty, isValid }
    } = useForm<GuestShippingSchema>({
        resolver: zodResolver(guestShippingSchema),
        mode: "onChange",
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

    // Auto-save logic
    const formValues = watch();

    useEffect(() => {
        // If invalid, clear parent selection
        if (!isValid) {
            onSelected?.(null);
            setIsSaved(false);
            return;
        }

        // If valid, auto-submit after a delay
        const timeoutId = setTimeout(() => {
            handleSubmit(onSubmit)();
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [formValues, isDirty, isValid, handleSubmit]);

    const onSubmit = async (data: GuestShippingSchema) => {
        if (!order) return;

        setErr(null);
        setSaving(true);

        try {
            if (!order?.orderNumber) return;
            
            await orderService.patchShippingAddress(order.orderNumber, {
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

            setIsSaved(true);
            onSelected?.(data);
            reset(data); // Mark as pristine
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Error al guardar");
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
                        <label htmlFor="recipientName" className="block text-sm text-dark mb-2 font-semibold">
                            Nombre del destinatario *
                        </label>
                        <input
                            type="text"
                            id="recipientName"
                            className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.recipientName ? "border-red-500" : "border-gray-3"}`}
                            {...register("recipientName")}
                            placeholder="Ej: Juan Pérez"
                        />
                        {errors.recipientName && <span className="text-red-500 text-xs">{errors.recipientName.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm text-dark mb-2 font-semibold">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.phone ? "border-red-500" : "border-gray-3"}`}
                            {...register("phone")}
                            placeholder="Ej: 11 1234-5678"
                        />
                        {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="street" className="block text-sm text-dark mb-2 font-semibold">
                                Calle *
                            </label>
                            <input
                                type="text"
                                id="street"
                                className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.street ? "border-red-500" : "border-gray-3"}`}
                                {...register("street")}
                            />
                            {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
                        </div>

                        <div>
                            <label htmlFor="streetNumber" className="block text-sm text-dark mb-2 font-semibold">
                                Número *
                            </label>
                            <input
                                type="text"
                                id="streetNumber"
                                className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.streetNumber ? "border-red-500" : "border-gray-3"}`}
                                {...register("streetNumber")}
                            />
                            {errors.streetNumber && <span className="text-red-500 text-xs">{errors.streetNumber.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="floor" className="block text-sm text-dark mb-2 font-semibold">
                                Piso (opcional)
                            </label>
                            <input
                                type="text"
                                id="floor"
                                className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark"
                                {...register("floor")}
                            />
                        </div>

                        <div>
                            <label htmlFor="apartmentNumber" className="block text-sm text-dark mb-2 font-semibold">
                                Depto (opcional)
                            </label>
                            <input
                                type="text"
                                id="apartmentNumber"
                                className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark"
                                {...register("apartmentNumber")}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm text-dark mb-2 font-semibold">
                            Ciudad *
                        </label>
                        <input
                            type="text"
                            id="city"
                            className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.city ? "border-red-500" : "border-gray-3"}`}
                            {...register("city")}
                        />
                        {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="state" className="block text-sm text-dark mb-2 font-semibold">
                                Provincia *
                            </label>
                            <input
                                type="text"
                                id="state"
                                className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.state ? "border-red-500" : "border-gray-3"}`}
                                {...register("state")}
                            />
                            {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
                        </div>

                        <div>
                            <label htmlFor="postalCode" className="block text-sm text-dark mb-2 font-semibold">
                                Código postal *
                            </label>
                            <input
                                type="text"
                                id="postalCode"
                                className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.postalCode ? "border-red-500" : "border-gray-3"}`}
                                {...register("postalCode")}
                            />
                            {errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode.message}</span>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm text-dark mb-2 font-semibold">
                            País *
                        </label>
                        <input
                            type="text"
                            id="country"
                            className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm outline-none bg-gray-2 text-dark-5 cursor-not-allowed shadow-sm"
                            value="Argentina"
                            disabled
                        />
                    </div>

                </form>
            </div>
        </div>
    );
};

export default GuestShippingForm;
