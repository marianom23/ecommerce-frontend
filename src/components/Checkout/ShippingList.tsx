"use client";
import React, { useState } from "react";
import { AddressResponse } from "@/services/addressService";

const ShippingList: React.FC<{
  title: string;
  loading: boolean;
  addresses: AddressResponse[];
  selectedId: number | null;
  onSelect: (addr: AddressResponse | null) => void;
  onAddNew: () => void;
}> = ({ title, loading, addresses, selectedId, onSelect, onAddNew }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleDetails = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="flex items-center justify-between border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-lg text-dark">{title}</h3>
        <button
          type="button"
          className="text-xs font-medium bg-blue/10 text-blue px-3 py-1.5 rounded-full hover:bg-blue hover:text-white transition-colors"
          onClick={onAddNew}
        >
          + Agregar nueva
        </button>
      </div>

      <div className="p-4 sm:p-8.5">
        {loading && <p className="text-sm text-dark-5">Cargando...</p>}

        {!loading && !addresses.length && (
          <p className="text-sm text-dark-5">No tenés direcciones de envío guardadas.</p>
        )}

        {!loading && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedId === a.id
                  ? "border-blue bg-blue/5 shadow-sm"
                  : "border-gray-3 hover:border-blue/40 hover:bg-gray-50"
                  }`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                  <input
                    type="radio"
                    name="shipping-addr"
                    checked={selectedId === a.id}
                    onChange={() => onSelect(a)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-blue checked:border-4 transition-all"
                  />
                </div>
                <div className="text-sm w-full">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">
                      {a.street} {a.streetNumber} {a.floor && `• Piso ${a.floor}`} {a.apartmentNumber && `• Depto ${a.apartmentNumber}`}
                    </div>
                    <button
                      onClick={(e) => toggleDetails(e, a.id)}
                      className="text-xs text-blue font-medium hover:underline ml-2 whitespace-nowrap flex items-center gap-1"
                    >
                      {expandedId === a.id ? "Ocultar" : "Ver detalle"}
                      <svg className={`w-3 h-3 transition-transform ${expandedId === a.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                  <div className="text-dark-5">
                    {a.city}{a.state ? `, ${a.state}` : ""} {a.postalCode ? `(${a.postalCode})` : ""} • {a.country}
                  </div>

                  {expandedId === a.id && (
                    <div className="mt-2 pt-2 border-t border-gray-2 text-xs text-dark-5 grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Calle:</span> {a.street}
                      </div>
                      <div>
                        <span className="font-medium">Altura:</span> {a.streetNumber}
                      </div>
                      {a.floor && (
                        <div>
                          <span className="font-medium">Piso:</span> {a.floor}
                        </div>
                      )}
                      {a.apartmentNumber && (
                        <div>
                          <span className="font-medium">Depto:</span> {a.apartmentNumber}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Ciudad:</span> {a.city}
                      </div>
                      <div>
                        <span className="font-medium">Provincia:</span> {a.state}
                      </div>
                      <div>
                        <span className="font-medium">CP:</span> {a.postalCode}
                      </div>
                      <div>
                        <span className="font-medium">País:</span> {a.country}
                      </div>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingList;
