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
  fullName: z.string().min(1, "El nombre/razón social es obligatorio"),
  documentType: z.string().min(1, "El tipo de documento es obligatorio"),
  documentNumber: z.string().min(1, "El número de documento es obligatorio"),
  taxCondition: z.string().min(1, "La condición impositiva es obligatoria"),
  email: z.string().email("El email no es válido").min(1, "El email es obligatorio"),
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
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<BillingSchema>({
    resolver: zodResolver(billingSchema),
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
        const defaultValues = {
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

        reset(defaultValues, { keepDirty: false });

        // Automatically notify parent and sync
        onSelected?.(defaultValues);
        if (order?.orderNumber) {
           orderService.patchBillingProfile(order.orderNumber, defaultValues as any).catch(() => {});
        }
        
        if (initialData.street || initialData.city) {
            setShowAddress(true);
        }
        return;
    }
  }, [isAuthenticated, reset, initialData]);

  const formValues = watch();

  // Auto save
  useEffect(() => {
    if (!isDirty) return;

    const isValid = formValues.fullName.length > 2 &&
      formValues.documentNumber.length >= 7 &&
      formValues.email.includes("@") &&
      formValues.email.includes(".");

    if (!isValid || onSaved) return;

    const timeoutId = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formValues, isDirty, handleSubmit]);

  const onSubmit = async (data: BillingSchema) => {
    setSyncStatus("saving");
    try {
      // 1. PATCH the order with raw data IF order exists (checkout mode)
      if (order?.orderNumber) {
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

      // 2. Upsert the billing profile (useful for 'My Account' or saving in checkout)
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
      reset(data, { keepValues: true }); // reset isDirty
      onSelected?.(data);
      if (onSaved && savedProfile) onSaved(savedProfile);
    } catch (e: any) {
      setSyncStatus("error");
    }
  };

  const copyShippingAddress = () => {
    if (!shippingAddress) return;
    setValue("street", shippingAddress.street || "", { shouldDirty: true });
    setValue("streetNumber", shippingAddress.streetNumber || "", { shouldDirty: true });
    setValue("floor", shippingAddress.floor || "", { shouldDirty: true });
    setValue("apartmentNumber", shippingAddress.apartmentNumber || "", { shouldDirty: true });
    setValue("city", shippingAddress.city || "", { shouldDirty: true });
    setValue("state", shippingAddress.state || "", { shouldDirty: true });
    setValue("postalCode", shippingAddress.postalCode || "", { shouldDirty: true });
    setShowAddress(true);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 relative">
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
              <span className="flex items-center gap-1.5 text-blue animate-in fade-in duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
                Guardando...
              </span>
            )}
            {syncStatus === "saved" && (
              <span className="text-green flex items-center gap-1 animate-in zoom-in duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Guardado
              </span>
            )}
            {syncStatus === "error" && <span className="text-red-500 text-[11px]">Error</span>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-dark mb-1">Nombre Completo / Razón Social *</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.fullName ? "border-red-500" : "border-gray-4"}`}
              {...register("fullName")}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-1">Tipo Doc. *</label>
            <select
              className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
              {...register("documentType")}
            >
              <option value="DNI">DNI</option>
              <option value="CUIT">CUIT</option>
              <option value="CUIL">CUIL</option>
              <option value="PAS">PAS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-1">Número Doc. *</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.documentNumber ? "border-red-500" : "border-gray-4"}`}
              {...register("documentNumber")}
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-1">Email *</label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white ${errors.email ? "border-red-500" : "border-gray-4"}`}
              {...register("email")}
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-1">Condición Impositiva *</label>
            <select
              className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
              {...register("taxCondition")}
            >
              <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
              <option value="MONOTRIBUTO">Monotributo</option>
              <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
              <option value="EXENTO">Exento</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-dark mb-1">Teléfono (opcional)</label>
            <input
              type="tel"
              className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
              {...register("phone")}
            />
          </div>

          {!showAddress && (
            <div className="sm:col-span-2 flex flex-wrap gap-4 mt-2">
              <button type="button" onClick={() => setShowAddress(true)} className="text-sm text-blue hover:underline">
                + Agregar dirección de facturación (opcional)
              </button>
              {shippingAddress && (
                <button type="button" onClick={copyShippingAddress} className="text-sm text-blue hover:underline">
                  Usar dirección de envío
                </button>
              )}
            </div>
          )}

          {showAddress && (
            <>
              <div className="sm:col-span-2 border-t border-gray-3 pt-4 mt-2 flex justify-between items-center">
                <label className="block text-sm font-medium text-dark">Dirección de Facturación (opcional)</label>
                <button
                  type="button"
                  onClick={() => setShowAddress(false)}
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
                />
              </div>

              <div>
                <label className="block text-sm text-dark mb-1">Altura</label>
                <input
                  className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                  {...register("streetNumber")}
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
                <label className="block text-sm text-dark mb-1">Prov. / Estado</label>
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
            </>
          )}
        </div>

        {onSaved && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={syncStatus === "saving"}
              className={`w-full sm:w-auto px-6 py-3 rounded-md font-medium text-white transition-all ${
                syncStatus === "saving" ? "bg-blue/70 cursor-not-allowed" : "bg-blue hover:bg-blue-dark shadow-sm hover:shadow"
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
