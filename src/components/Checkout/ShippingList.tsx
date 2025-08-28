"use client";
import React from "react";
import { AddressResponse } from "@/services/addressService";

const ShippingList: React.FC<{
  title: string;
  loading: boolean;
  addresses: AddressResponse[];
  selectedId: number | null;
  onSelect: (addr: AddressResponse | null) => void;
  onAddNew: () => void;
}> = ({ title, loading, addresses, selectedId, onSelect, onAddNew }) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg text-dark">{title}</h3>
        <button type="button" className="text-blue text-sm" onClick={onAddNew}>
          Agregar nueva
        </button>
      </div>

      {loading && <p className="text-sm text-dark-5">Cargando...</p>}

      {!loading && !addresses.length && (
        <p className="text-sm text-dark-5">No tenés direcciones de envío guardadas.</p>
      )}

      {!loading && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((a) => (
            <label key={a.id} className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:border-blue/60">
              <input
                type="radio"
                name="shipping-addr"
                checked={selectedId === a.id}
                onChange={() => onSelect(a)}
                className="mt-1"
              />
              <div className="text-sm">
                <div className="font-medium">
                  {a.street} {a.streetNumber} {a.floor && `• Piso ${a.floor}`} {a.apartmentNumber && `• Depto ${a.apartmentNumber}`}
                </div>
                <div className="text-dark-5">
                  {a.city}{a.state ? `, ${a.state}` : ""} {a.postalCode ? `(${a.postalCode})` : ""} • {a.country}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingList;
