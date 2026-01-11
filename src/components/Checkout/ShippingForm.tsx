"use client";
import React, { useEffect } from "react";
import { AddressResponse, addressService, AddressType } from "@/services/addressService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressSchema } from "@/lib/schemas";

const ShippingForm: React.FC<{
  initialData?: AddressResponse;
  type?: AddressType;
  onSaved: (addr: AddressResponse) => void;
  onCancel?: () => void;
}> = ({ initialData, type = "SHIPPING", onSaved, onCancel }) => {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "Argentina",
      type: type, // Esto puede no estar en el schema visual pero lo necesitamos
    }
  });

  useEffect(() => {
    if (initialData) {
      // Mapear datos iniciales
      reset({
        street: initialData.street,
        streetNumber: initialData.streetNumber || "",
        apartmentNumber: initialData.apartmentNumber || "",
        floor: initialData.floor || "",
        city: initialData.city,
        state: initialData.state || "",
        postalCode: initialData.postalCode || "",
        country: initialData.country,
        type: initialData.type,
      });
    } else {
      setValue("type", type);
    }
  }, [initialData, type, reset, setValue]);

  const onSubmit = async (data: AddressSchema) => {
    try {
      let result: AddressResponse;
      // Aseguramos que el tipo esté correcto
      const payload = { ...data, type };

      if (initialData) {
        result = await addressService.update(initialData.id, payload);
      } else {
        result = await addressService.create(payload);
      }
      onSaved(result);
    } catch (e: any) {
      // En un caso real, podrías usar setError de hook-form para mostrar error general
      console.error(e);
      alert(e?.response?.data?.message || "Error al guardar la dirección");
    }
  };

  return (
    <div className="bg-gray-1 rounded-[10px] p-4 sm:p-6">
      <h3 className="font-medium text-dark mb-4">
        {initialData ? "Editar dirección" : "Nueva dirección"}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-dark mb-1">Calle</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.street ? "border-red-500" : "border-gray-4"}`}
              {...register("street")}
              placeholder="Ej: Av. Corrientes"
            />
            {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">Altura</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.streetNumber ? "border-red-500" : "border-gray-4"}`}
              {...register("streetNumber")}
              placeholder="1234"
            />
            {errors.streetNumber && <span className="text-red-500 text-xs">{errors.streetNumber.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">Piso (opcional)</label>
            <input
              className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
              {...register("floor")}
            />
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">Depto (opcional)</label>
            <input
              className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
              {...register("apartmentNumber")}
            />
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">Ciudad / Localidad</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.city ? "border-red-500" : "border-gray-4"}`}
              {...register("city")}
            />
            {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">Provincia / Estado</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.state ? "border-red-500" : "border-gray-4"}`}
              {...register("state")}
            />
            {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">Código Postal</label>
            <input
              className={`w-full border rounded px-3 py-2 text-sm focus:border-blue outline-none ${errors.postalCode ? "border-red-500" : "border-gray-4"}`}
              {...register("postalCode")}
            />
            {errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-dark mb-1">País</label>
            <input
              className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-gray-2"
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

export default ShippingForm;
