"use client";
import React, { useState } from "react";
import { AddressRequest, AddressResponse, addressService } from "@/services/addressService";

const BillingForm: React.FC<{
  onSaved: (addr: AddressResponse) => void;
  onCancel?: () => void;
}> = ({ onSaved, onCancel }) => {
  const [form, setForm] = useState<AddressRequest>({
    type: "BILLING",
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

  async function save() {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const created = await addressService.create(form);
      onSaved(created);
    } catch (e: any) {
      setErr(e?.message || "No se pudo guardar la dirección.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-1 rounded-[10px] p-4 sm:p-6">
      <h3 className="font-medium text-dark mb-4">
        Cargar dirección de facturación
      </h3>

      {err && <div className="text-red-500 text-sm mb-3">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-dark mb-1">Calle</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.street}
            onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
            placeholder="Ej: Av. Corrientes"
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Altura</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.streetNumber || ""}
            onChange={(e) => setForm((f) => ({ ...f, streetNumber: e.target.value }))}
            placeholder="1234"
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Piso (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.floor || ""}
            onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Depto (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.apartmentNumber || ""}
            onChange={(e) => setForm((f) => ({ ...f, apartmentNumber: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Ciudad / Localidad</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Provincia / Estado</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.state || ""}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Código Postal</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.postalCode || ""}
            onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
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
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-dark hover:text-black"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
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

export default BillingForm;
