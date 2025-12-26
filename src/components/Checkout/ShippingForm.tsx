"use client";
import React, { useState, useEffect } from "react";
import { AddressRequest, AddressResponse, addressService, AddressType } from "@/services/addressService";

const ShippingForm: React.FC<{
  initialData?: AddressResponse;
  type?: AddressType;
  onSaved: (addr: AddressResponse) => void;
  onCancel?: () => void;
}> = ({ initialData, type = "SHIPPING", onSaved, onCancel }) => {
  const [form, setForm] = useState<AddressRequest>({
    type: type,
    street: "",
    streetNumber: "",
    apartmentNumber: "",
    floor: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Argentina",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type,
        street: initialData.street,
        streetNumber: initialData.streetNumber || "",
        apartmentNumber: initialData.apartmentNumber || "",
        floor: initialData.floor || "",
        city: initialData.city,
        state: initialData.state || "",
        postalCode: initialData.postalCode || "",
        country: initialData.country,
      });
    } else {
      setForm(prev => ({ ...prev, type }));
    }
  }, [initialData, type]);

  async function save() {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      let result: AddressResponse;
      if (initialData) {
        result = await addressService.update(initialData.id, form);
      } else {
        result = await addressService.create(form);
      }
      onSaved(result);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Error al guardar la dirección");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-1 rounded-[10px] p-4 sm:p-6">
      <h3 className="font-medium text-dark mb-4">
        {initialData ? "Editar dirección" : "Nueva dirección"}
      </h3>

      {err && <div className="text-red-500 text-sm mb-3">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-dark mb-1">Calle</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            placeholder="Ej: Av. Corrientes"
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Altura</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.streetNumber || ""}
            onChange={(e) => setForm({ ...form, streetNumber: e.target.value })}
            placeholder="1234"
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Piso (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.floor || ""}
            onChange={(e) => setForm({ ...form, floor: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Depto (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.apartmentNumber || ""}
            onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Ciudad / Localidad</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Provincia / Estado</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.state || ""}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Código Postal</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.postalCode || ""}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">País</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-gray-2"
            value={form.country}
            disabled
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-dark hover:text-black"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={save}
          disabled={loading || !form.street || !form.streetNumber || !form.city}
          className="px-6 py-2 bg-blue text-white text-sm font-medium rounded hover:bg-blue-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
};

export default ShippingForm;
