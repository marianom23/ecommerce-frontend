"use client";
import React, { useState, useEffect } from "react";
import { type OrderResponse, orderService } from "@/services/orderService";
import { AddressResponse } from "@/services/addressService";
import { billingProfileService, type BillingProfileResponse } from "@/services/billingProfileService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const billingSchema = z.object({
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  documentType: z.string().optional(),
  documentNumber: z.string().optional().refine((value) => !value || value.length >= 7, "Mínimo 7 caracteres"),
  taxCondition: z.string().min(1, "La condición impositiva es obligatoria"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  phone: z.string().optional(),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  floor: z.string().optional(),
  apartmentNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

type BillingSchema = z.infer<typeof billingSchema>;

type Props = {
  order?: OrderResponse | null;
  shippingAddress?: AddressResponse | null;
  onSelected?: (data: any) => void;
  initialData?: BillingProfileResponse | null;
  onSaved?: (data: any) => void;
  onCancel?: () => void;
};

export default function BillingProfileForm({ order, shippingAddress, onSelected, initialData, onSaved, onCancel }: Props) {
  const { isAuthenticated } = useAuth();
  const [showAddress, setShowAddress] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error" | "incomplete">("idle");
  const [profileId, setProfileId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<BillingSchema>({
    resolver: zodResolver(billingSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      documentType: "DNI",
      documentNumber: "",
      taxCondition: "CONSUMIDOR_FINAL",
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
    },
  });

  useEffect(() => {
    if (initialData) {
        setProfileId(initialData.id);
        const data = {
          fullName: initialData.fullName || "",
          documentType: initialData.documentType || "DNI",
          documentNumber: initialData.documentNumber || "",
          taxCondition: initialData.taxCondition || "CONSUMIDOR_FINAL",
          email: initialData.emailForInvoices || "",
          phone: initialData.phone || "",
          street: initialData.street || "",
          streetNumber: initialData.streetNumber || "",
          floor: initialData.floor || "",
          apartmentNumber: initialData.apartmentNumber || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postalCode: initialData.postalCode || "",
          country: initialData.country || "Argentina",
        };
        reset(data, { keepDirty: false });
        if (initialData.street || initialData.city) setShowAddress(true);
    }
  }, [initialData, reset]);

  const formValues = watch();
  const shouldAutoSave = !isAuthenticated && !initialData;

  const submitLabel = initialData
    ? "Guardar cambios"
    : isAuthenticated
      ? "Guardar perfil"
      : "Guardar datos";

  const onSubmit = async (data: BillingSchema) => {
    setSyncStatus("saving");
    try {
      if (order?.orderNumber) {
          console.log("Enviando patchBillingProfile:", data);
          await orderService.patchBillingProfile(order.orderNumber, {
            fullName: data.fullName,
            documentType: data.documentNumber ? data.documentType : undefined,
            documentNumber: data.documentNumber || undefined,
            taxCondition: data.taxCondition,
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
      }

      let savedProfile = null;
      if (isAuthenticated || initialData) {
          const profileData = {
              fullName: data.fullName,
              documentType: data.documentNumber ? data.documentType as any : undefined,
              documentNumber: data.documentNumber || undefined,
              taxCondition: data.taxCondition as any,
              emailForInvoices: data.email,
              phone: data.phone,
              street: data.street,
              streetNumber: data.streetNumber,
              floor: data.floor,
              apartmentNumber: data.apartmentNumber,
              city: data.city,
              state: data.state,
              postalCode: data.postalCode,
              country: data.country,
              isDefault: true
          };
          if (profileId) {
              savedProfile = await billingProfileService.update(profileId, profileData);
          } else {
              savedProfile = await billingProfileService.create(profileData);
              if (savedProfile) setProfileId(savedProfile.id);
          }
      }

      setSyncStatus("saved");
      reset(data, { keepValues: true });
      onSelected?.(savedProfile || data);
      if (onSaved && savedProfile) onSaved(savedProfile);
    } catch (e: any) {
      console.error("Error en onSubmit:", e);
      setSyncStatus("error");
      toast.error(e?.response?.data?.message || "No se pudo guardar la facturacion.");
    }
  };

  useEffect(() => {
    if (!shouldAutoSave) return;

    if (!isValid || !order?.orderNumber) {
      setSyncStatus("incomplete");
      onSelected?.(null);
      return;
    }

    setSyncStatus("idle");
    const timeoutId = window.setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [formValues, handleSubmit, isValid, onSelected, order?.orderNumber, shouldAutoSave]);

  const copyShippingAddress = () => {
    if (!shippingAddress) return;
    const fields: (keyof BillingSchema)[] = ["street", "streetNumber", "floor", "apartmentNumber", "city", "state", "postalCode"];
    fields.forEach(f => {
        if (shippingAddress[f as keyof AddressResponse]) {
            setValue(f, String(shippingAddress[f as keyof AddressResponse]), { shouldDirty: true, shouldValidate: true });
        }
    });
    setShowAddress(true);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 relative min-h-[400px]">
      <div className="flex items-center justify-between mb-4 border-b border-gray-3 pb-5">
        <h3 className="font-medium text-dark text-xl">Información de Facturación</h3>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-sm font-medium text-dark-5 hover:text-dark">
               Volver
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-4">
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Nombre Completo / Razón Social *</label>
            <input
              className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.fullName ? "border-red-500 bg-red-50" : "border-gray-3"}`}
              {...register("fullName")}
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Email *</label>
            <input
              type="email"
              className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.email ? "border-red-500 bg-red-50" : "border-gray-3"}`}
              {...register("email")}
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Condición Impositiva *</label>
            <select
              className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark bg-white"
              {...register("taxCondition")}
            >
              <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
              <option value="MONOTRIBUTO">Monotributo</option>
              <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
              <option value="EXENTO">Exento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Teléfono (opcional)</label>
            <input
              type="tel"
              className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark"
              {...register("phone")}
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Tipo Doc. (opcional)</label>
            <select
              className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark bg-white"
              {...register("documentType")}
            >
              <option value="DNI">DNI</option>
              <option value="CUIT">CUIT</option>
              <option value="CUIL">CUIL</option>
              <option value="PAS">PAS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Número Doc. (opcional)</label>
            <input
              className={`w-full border rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm placeholder:text-gray-400 text-dark ${errors.documentNumber ? "border-red-500 bg-red-50" : "border-gray-3"}`}
              {...register("documentNumber")}
            />
            {errors.documentNumber && <p className="text-[11px] text-red-500 mt-1">{errors.documentNumber.message}</p>}
          </div>


          {!showAddress && (
            <div className="sm:col-span-2 flex flex-wrap gap-4 mt-2">
              <button type="button" onClick={() => setShowAddress(true)} className="text-sm font-medium text-blue hover:text-blue-dark transition-colors">
                + Agregar dirección de facturación (opcional)
              </button>
              {shippingAddress && (
                <button type="button" onClick={copyShippingAddress} className="text-sm font-medium text-blue hover:text-blue-dark transition-colors">
                  Usar dirección de envío
                </button>
              )}
            </div>
          )}

          {showAddress && (
            <>
              <div className="sm:col-span-2 border-t border-gray-3 pt-4 mt-2 flex justify-between items-center">
                <label className="block text-sm font-bold text-dark">Dirección de Facturación</label>
                <button type="button" onClick={() => setShowAddress(false)} className="text-xs text-red-500 hover:underline">
                  Quitar dirección
                </button>
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Calle</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("street")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Altura</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("streetNumber")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Piso</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("floor")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Depto</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("apartmentNumber")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Ciudad</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("city")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Provincia</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("state")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2 font-semibold">Código Postal</label>
                <input className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm focus:ring-4 focus:ring-blue/15 focus:border-blue outline-none transition-all bg-white shadow-sm text-dark" {...register("postalCode")} />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {syncStatus === "error" && (
            <p className="text-xs text-red-500 mr-auto">No se pudo guardar. Revisá los datos e intentá de nuevo.</p>
          )}
          {shouldAutoSave && syncStatus !== "error" && (
            <p className="text-xs text-dark-5 mr-auto">
              {syncStatus === "saving"
                ? "Guardando datos..."
                : syncStatus === "saved"
                  ? "Datos guardados"
                  : "Se guarda automaticamente"}
            </p>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-dark hover:text-black"
            >
              Cancelar
            </button>
          )}
          {!shouldAutoSave && (
            <button
              type="submit"
              disabled={isSubmitting || syncStatus === "saving"}
              className="px-6 py-2.5 bg-blue text-white text-sm font-medium rounded hover:bg-blue-dark disabled:opacity-60"
            >
              {isSubmitting || syncStatus === "saving" ? "Guardando..." : submitLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

