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
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg text-dark">Cargar dirección de facturación</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-blue text-sm">Cancelar</button>
        )}
      </div>

      {err && <p className="mb-4 text-red-600 text-sm">{err}</p>}

      {/* Country */}
      <div className="mb-5">
        <label htmlFor="countryName" className="block mb-2.5">Country/Region <span className="text-red">*</span></label>
        <input
          id="countryName"
          className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          required
          placeholder="Argentina"
        />
      </div>

      {/* Street */}
      <div className="mb-5">
        <label htmlFor="street" className="block mb-2.5">Street Address <span className="text-red">*</span></label>
        <input
          id="street"
          className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
          value={form.street}
          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          placeholder="Calle"
          required
        />

        <div className="mt-5 grid grid-cols-3 gap-3">
          <input
            id="streetNumber"
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
            value={form.streetNumber || ""}
            onChange={(e) => setForm((f) => ({ ...f, streetNumber: e.target.value }))}
            placeholder="Número"
          />
          <input
            id="floor"
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
            value={form.floor || ""}
            onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
            placeholder="Piso"
          />
          <input
            id="apartmentNumber"
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
            value={form.apartmentNumber || ""}
            onChange={(e) => setForm((f) => ({ ...f, apartmentNumber: e.target.value }))}
            placeholder="Depto"
          />
        </div>
      </div>

      {/* City */}
      <div className="mb-5">
        <label htmlFor="city" className="block mb-2.5">Town/City <span className="text-red">*</span></label>
        <input
          id="city"
          className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          required
        />
      </div>

      {/* State / Postal */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="state" className="block mb-2.5">State / Province</label>
          <input
            id="state"
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
            value={form.state || ""}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            placeholder="Mendoza"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block mb-2.5">Postal Code</label>
          <input
            id="postalCode"
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:shadow-input focus:ring-2 focus:ring-blue/20"
            value={form.postalCode || ""}
            onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            placeholder="5500"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={save}
        className="w-full inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Guardando..." : "Guardar dirección de facturación"}
      </button>
    </div>
  );
};

export default BillingForm;
