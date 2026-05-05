"use client";
import React, { useState } from "react";
import { AddressResponse, addressService } from "@/services/addressService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressSchema } from "@/lib/schemas";

const BillingForm: React.FC<{
  onSaved: (addr: AddressResponse) => void;
  onCancel?: () => void;
}> = ({ onSaved, onCancel }) => {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "Argentina",
      type: "BILLING",
    }
  });

  const onSubmit = async (data: AddressSchema) => {
    try {
      // Forzamos tipo BILLING
      const payload = { ...data, type: "BILLING" } as any;
      const created = await addressService.create(payload);
      onSaved(created);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "No se pudo guardar la dirección.");
    }
  };

  return (
    <div className="bg-gray-1 rounded-[10px] p-4 sm:p-6">
      <h3 className="font-medium text-dark mb-4">
        Cargar dirección de facturación
      </h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Calle</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.street ? "border-red-500" : "border-gray-3"}`}
              {...register("street")}
              placeholder="Ej: Av. Corrientes"
            />
            {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Altura</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.streetNumber ? "border-red-500" : "border-gray-3"}`}
              {...register("streetNumber")}
              placeholder="1234"
            />
            {errors.streetNumber && <span className="text-red-500 text-xs">{errors.streetNumber.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Piso (opcional)</label>
            <input
              className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
              {...register("floor")}
            />
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Depto (opcional)</label>
            <input
              className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
              {...register("apartmentNumber")}
            />
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Ciudad / Localidad</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.city ? "border-red-500" : "border-gray-3"}`}
              {...register("city")}
            />
            {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Provincia / Estado</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.state ? "border-red-500" : "border-gray-3"}`}
              {...register("state")}
            />
            {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">Código Postal</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.postalCode ? "border-red-500" : "border-gray-3"}`}
              {...register("postalCode")}
            />
            {errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-2 font-semibold">País</label>
            <input
              className="w-full border border-gray-3 rounded-lg px-3.5 py-3 text-sm outline-none bg-gray-2 text-dark-5 cursor-not-allowed shadow-sm"
              value="Argentina"
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-dark hover:text-black"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue text-white text-sm font-medium rounded hover:bg-blue-dark disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;
