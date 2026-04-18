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
  documentType: z.string().min(1, "El tipo de documento es obligatorio"),
  documentNumber: z.string().min(7, "Mínimo 7 caracteres"),
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
    formState: { errors, isDirty, isValid: isFormValid },
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

  useEffect(() => {
    if (!isDirty) return;

    if (!isFormValid || onSaved) {
        if (!isFormValid) setSyncStatus("incomplete");
        return;
    }

    const timeoutId = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [formValues, isDirty, isFormValid, handleSubmit, onSaved]);

  const onSubmit = async (data: BillingSchema) => {
    setSyncStatus("saving");
    try {
      if (order?.orderNumber) {
          console.log("🚀 Enviando patchBillingProfile:", data);
          await orderService.patchBillingProfile(order.orderNumber, {
            fullName: data.fullName,
            documentType: data.documentType,
            documentNumber: data.documentNumber,
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
              documentType: data.documentType as any,
              documentNumber: data.documentNumber,
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
              savedProfile = await billingProfileService.update(profileId, profileData).catch(() => null);
          } else {
              savedProfile = await billingProfileService.create(profileData).catch(() => null);
              if (savedProfile) setProfileId(savedProfile.id);
          }
      }

      setSyncStatus("saved");
      reset(data, { keepValues: true });
      onSelected?.(data);
      if (onSaved && savedProfile) onSaved(savedProfile);
    } catch (e: any) {
      console.error("❌ Error en onSubmit:", e);
      setSyncStatus("error");
    }
  };

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
          <div className="text-[12px] font-medium h-6 flex items-center">
            {syncStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-blue animate-pulse">
                <div className="h-1.5 w-1.5 rounded-full bg-blue" />
                Guardando...
              </span>
            )}
            {syncStatus === "saved" && (
              <span className="text-green flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Guardado
              </span>
            )}
            {syncStatus === "incomplete" && (
              <span className="text-orange-500 flex items-center gap-1 italic">
                 Faltan datos...
              </span>
            )}
            {syncStatus === "error" && <span className="text-red-500">Error al guardar</span>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-dark mb-1 font-medium">Nombre Completo / Razón Social *</label>
            <input
              className={`w-full border rounded px-3 py-2.5 text-sm focus:border-blue outline-none transition-all ${errors.fullName ? "border-red-500 bg-red-50" : "border-gray-4"}`}
              {...register("fullName")}
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-dark mb-1 font-medium">Tipo Doc. *</label>
            <select
              className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none bg-white"
              {...register("documentType")}
            >
              <option value="DNI">DNI</option>
              <option value="CUIT">CUIT</option>
              <option value="CUIL">CUIL</option>
              <option value="PAS">PAS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-1 font-medium">Número Doc. *</label>
            <input
              className={`w-full border rounded px-3 py-2.5 text-sm focus:border-blue outline-none transition-all ${errors.documentNumber ? "border-red-500 bg-red-50" : "border-gray-4"}`}
              {...register("documentNumber")}
            />
            {errors.documentNumber && <p className="text-[11px] text-red-500 mt-1">{errors.documentNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-dark mb-1 font-medium">Email *</label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2.5 text-sm focus:border-blue outline-none transition-all ${errors.email ? "border-red-500 bg-red-50" : "border-gray-4"}`}
              {...register("email")}
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-dark mb-1 font-medium">Condición Impositiva *</label>
            <select
              className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none bg-white"
              {...register("taxCondition")}
            >
              <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
              <option value="MONOTRIBUTO">Monotributo</option>
              <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
              <option value="EXENTO">Exento</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-dark mb-1 font-medium">Teléfono (opcional)</label>
            <input
              type="tel"
              className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none"
              {...register("phone")}
            />
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
                <label className="block text-sm text-dark mb-1 font-medium">Calle</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("street")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1 font-medium">Altura</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("streetNumber")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1 font-medium">Piso</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("floor")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1 font-medium">Depto</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("apartmentNumber")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1 font-medium">Ciudad</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("city")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1 font-medium">Provincia</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("state")} />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1 font-medium">Código Postal</label>
                <input className="w-full border border-gray-4 rounded px-3 py-2.5 text-sm focus:border-blue outline-none" {...register("postalCode")} />
              </div>
            </>
          )}
        </div>

        {onSaved && (
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={syncStatus === "saving"}
              className={`w-full sm:w-auto px-10 py-3.5 rounded-lg font-bold text-white transition-all shadow-md ${
                syncStatus === "saving" ? "bg-blue/70 cursor-not-allowed" : "bg-blue hover:bg-blue-dark active:scale-95"
              }`}
            >
              {syncStatus === "saving" ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
