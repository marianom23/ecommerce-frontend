"use client";
import React, { useState, useEffect } from "react";
import { AddressResponse } from "@/services/addressService";
import { orderService, type OrderResponse } from "@/services/orderService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Props = {
    order?: OrderResponse | null;
    shippingAddress?: AddressResponse | null;
    onSelected?: (data: any) => void;
};

// Schema Definition
const guestBillingSchema = z.object({
    fullName: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("El email no es válido").min(1, "El email es obligatorio"),
    phone: z.string().optional(),
    // Address fields (optional but validated if present - or enforced if we want stricter rules)
    // For now keeping them as optional matching previous logic, or string
    street: z.string().optional(),
    streetNumber: z.string().optional(),
    floor: z.string().optional(),
    apartmentNumber: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string(),
});

type GuestBillingSchema = z.infer<typeof guestBillingSchema>;

/**
 * Formulario de billing para GUESTS
 * Basado en BillingProfileForm.tsx original pero simplificado
 * - Email: obligatorio y validado
 * - Teléfono: opcional
 * - Dirección: opcional (colapsable)
 */
const GuestBillingForm: React.FC<Props> = ({ order, shippingAddress, onSelected }) => {
    const [showAddress, setShowAddress] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isDirty }
    } = useForm<GuestBillingSchema>({
        resolver: zodResolver(guestBillingSchema),
        defaultValues: {
            fullName: "",
            email: "",
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

    const formValues = watch();

    // Reset isSaved only when form becomes dirty again
    useEffect(() => {
        if (isSaved && isDirty) {
            setIsSaved(false);
        }
    }, [isDirty, isSaved]);

    function copyShippingAddress() {
        if (!shippingAddress) return;
        // Set values individually to ensure UI updates but keep form dirty if needed
        // Or simply set them. Since this is a "user action", it makes the form dirty, which is fine.
        setValue("street", shippingAddress.street || "", { shouldDirty: true });
        setValue("streetNumber", shippingAddress.streetNumber || "", { shouldDirty: true });
        setValue("floor", shippingAddress.floor || "", { shouldDirty: true });
        setValue("apartmentNumber", shippingAddress.apartmentNumber || "", { shouldDirty: true });
        setValue("city", shippingAddress.city || "", { shouldDirty: true });
        setValue("state", shippingAddress.state || "", { shouldDirty: true });
        setValue("postalCode", shippingAddress.postalCode || "", { shouldDirty: true });

        setShowAddress(true);
        toast.success("Dirección copiada del envío");
    }

    const onSubmit = async (data: GuestBillingSchema) => {
        if (loading) return;
        if (!order?.orderNumber) {
            toast.error("No hay orden activa");
            return;
        }

        setErr(null);
        setLoading(true);

        try {
            await orderService.patchBillingProfile(order.orderNumber, {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone || undefined,
                street: data.street || undefined,
                streetNumber: data.streetNumber || undefined,
                floor: data.floor || undefined,
                apartmentNumber: data.apartmentNumber || undefined,
                city: data.city || undefined,
                state: data.state || undefined,
                postalCode: data.postalCode || undefined,
                country: data.country || undefined,
            } as any);

            toast.success("Información de facturación guardada ✓");
            // Mark current data as "saved/pristine" so isDirty becomes false
            reset(data);
            setIsSaved(true);
            onSelected?.(data);
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "No se pudo guardar la información."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
            <h3 className="font-medium text-dark mb-4">
                Información de Facturación
            </h3>

            {err && <div className="text-red-500 text-sm mb-3">{err}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Campos obligatorios */}
                    <div>
                        <label className="block text-sm text-dark mb-1">Nombre Completo *</label>
                        <input
                            className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.fullName ? "border-red-500" : "border-gray-4"}`}
                            {...register("fullName")}
                            placeholder="Juan Pérez"
                        />
                        {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm text-dark mb-1">Email *</label>
                        <input
                            type="email"
                            className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.email ? "border-red-500" : "border-gray-4"}`}
                            {...register("email")}
                            placeholder="tu@email.com"
                        />
                        {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm text-dark mb-1">Teléfono (opcional)</label>
                        <input
                            type="tel"
                            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                            {...register("phone")}
                            placeholder="11 1234-5678"
                        />
                    </div>

                    {/* Botón para mostrar dirección */}
                    {!showAddress && (
                        <div className="sm:col-span-2 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowAddress(true)}
                                className="text-sm text-blue hover:underline"
                            >
                                + Agregar dirección de facturación (opcional)
                            </button>
                            {shippingAddress && (
                                <button
                                    type="button"
                                    onClick={copyShippingAddress}
                                    className="text-sm text-blue hover:underline"
                                >
                                    Usar dirección de envío
                                </button>
                            )}
                        </div>
                    )}

                    {/* Dirección opcional - Formulario colapsable */}
                    {showAddress && (
                        <>
                            <div className="sm:col-span-2 border-t border-gray-3 pt-4 mt-2 flex justify-between items-center">
                                <label className="block text-sm font-medium text-dark">
                                    Dirección de Facturación (opcional)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddress(false);
                                        // Limpiar datos de dirección al ocultar
                                        setValue("street", "");
                                        setValue("streetNumber", "");
                                        setValue("floor", "");
                                        setValue("apartmentNumber", "");
                                        setValue("city", "");
                                        setValue("state", "");
                                        setValue("postalCode", "");
                                    }}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    Ocultar
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Calle</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("street")}
                                    placeholder="Ej: Av. Corrientes"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Altura</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("streetNumber")}
                                    placeholder="1234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Piso</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("floor")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Depto</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("apartmentNumber")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Ciudad / Localidad</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("city")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Provincia / Estado</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("state")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">Código Postal</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                                    {...register("postalCode")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark mb-1">País</label>
                                <input
                                    className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-gray-2"
                                    {...register("country")}
                                    disabled
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    {isSaved ? (
                        <button
                            type="button"
                            className="px-6 py-2 bg-green text-white text-sm font-medium rounded flex items-center gap-2 cursor-default"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white" fillOpacity="0.2" />
                                <path d="M16 11L11 16L8 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Guardado
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue text-white text-sm font-medium rounded hover:bg-blue-dark disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GuestBillingForm;
