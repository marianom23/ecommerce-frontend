import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressSchema } from "@/lib/schemas";
import { addressService } from "@/services/addressService";
import toast from "react-hot-toast";

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onAddressSaved: () => void; // Callback para recargar la lista
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, closeModal, onAddressSaved }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "Argentina",
    }
  });

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      reset(); // Limpiar formulario al cerrar
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal, reset]);

  const onSubmit = async (data: AddressSchema) => {
    setLoading(true);
    try {
      // Default to SHIPPING if not specified
      const payload = { ...data, type: data.type || "SHIPPING" };
      await addressService.create(payload as any);
      toast.success("Dirección guardada correctamente");
      onAddressSaved();
      closeModal();
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al guardar la dirección");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto w-full h-screen sm:py-20 xl:py-25 2xl:py-[100px] bg-dark/70 sm:px-8 px-4 py-5 ${isOpen ? "block z-99999" : "hidden"
        }`}
    >
      <div className="flex items-center justify-center min-h-screen sm:min-h-0">
        <div
          className="w-full max-w-[900px] rounded-xl shadow-3 bg-white p-6 sm:p-10 relative modal-content"
        >
          <button
            onClick={closeModal}
            aria-label="button for close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-8 h-8 rounded-full bg-gray-1 text-dark hover:bg-gray-2 duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentcolor" />
            </svg>
          </button>

          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-dark mb-2">Nueva Dirección</h3>
            <p className="text-sm text-dark-5">Ingresa los detalles de tu nueva dirección de envío.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Calle y Altura */}
            <div className="flex flex-col sm:flex-row gap-5 mb-5">
              <div className="w-full sm:w-2/3">
                <label className="block mb-2 text-sm font-medium text-dark">Calle</label>
                <input
                  type="text"
                  {...register("street")}
                  placeholder="Ej: Av. Corrientes"
                  className={`w-full rounded-md border py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1 ${errors.street ? "border-red-500" : "border-gray-3"}`}
                />
                {errors.street && <span className="text-red-500 text-xs mt-1 block">{errors.street.message}</span>}
              </div>
              <div className="w-full sm:w-1/3">
                <label className="block mb-2 text-sm font-medium text-dark">Altura</label>
                <input
                  type="text"
                  {...register("streetNumber")}
                  placeholder="1234"
                  className={`w-full rounded-md border py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1 ${errors.streetNumber ? "border-red-500" : "border-gray-3"}`}
                />
                {errors.streetNumber && <span className="text-red-500 text-xs mt-1 block">{errors.streetNumber.message}</span>}
              </div>
            </div>

            {/* Piso y Depto */}
            <div className="flex flex-col sm:flex-row gap-5 mb-5">
              <div className="w-full sm:w-1/2">
                <label className="block mb-2 text-sm font-medium text-dark">Piso (Opcional)</label>
                <input
                  type="text"
                  {...register("floor")}
                  className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block mb-2 text-sm font-medium text-dark">Depto (Opcional)</label>
                <input
                  type="text"
                  {...register("apartmentNumber")}
                  className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1"
                />
              </div>
            </div>

            {/* Ciudad, Provincia, CP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-dark">Ciudad</label>
                <input
                  type="text"
                  {...register("city")}
                  className={`w-full rounded-md border py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1 ${errors.city ? "border-red-500" : "border-gray-3"}`}
                />
                {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city.message}</span>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-dark">Provincia</label>
                <input
                  type="text"
                  {...register("state")}
                  className={`w-full rounded-md border py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1 ${errors.state ? "border-red-500" : "border-gray-3"}`}
                />
                {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state.message}</span>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-dark">Código Postal</label>
                <input
                  type="text"
                  {...register("postalCode")}
                  className={`w-full rounded-md border py-2.5 px-5 outline-none duration-200 focus:border-blue bg-gray-1 ${errors.postalCode ? "border-red-500" : "border-gray-3"}`}
                />
                {errors.postalCode && <span className="text-red-500 text-xs mt-1 block">{errors.postalCode.message}</span>}
              </div>
            </div>

            <div className="mb-8">
              <label className="block mb-2 text-sm font-medium text-dark">País</label>
              <input
                type="text"
                {...register("country")}
                disabled
                className="w-full rounded-md border border-gray-3 py-2.5 px-5 bg-gray-2 text-dark-5 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70"
            >
              {loading ? "Guardando..." : "Guardar Dirección"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
