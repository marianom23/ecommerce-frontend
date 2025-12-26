// components/Checkout/BillingProfileList.tsx
"use client";
import React, { useState } from "react";
import { BillingProfileResponse, billingProfileService } from "@/services/billingProfileService";
import { AddressResponse } from "@/services/addressService";

const BillingProfileList: React.FC<{
  title: string;
  loading: boolean;
  profiles: BillingProfileResponse[];
  addresses?: AddressResponse[];
  selectedId: number | null;
  onSelect: (bp: BillingProfileResponse | null) => void;
  onAddNew: () => void;
}> = ({ title, loading, profiles, addresses = [], selectedId, onSelect, onAddNew }) => {
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
          + Agregar nuevo
        </button>
      </div>

      <div className="p-4 sm:p-8.5">
        {loading && <p className="text-sm text-dark-5">Cargando...</p>}

        {!loading && !profiles.length && (
          <p className="text-sm text-dark-5">No tenés perfiles de facturación guardados.</p>
        )}

        {!loading && profiles.length > 0 && (
          <div className="space-y-3">
            {profiles.map((p) => (
              <label
                key={p.id}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedId === p.id
                  ? "border-blue bg-blue/5 shadow-sm"
                  : "border-gray-3 hover:border-blue/40 hover:bg-gray-50"
                  }`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                  <input
                    type="radio"
                    name="billing-profile"
                    checked={selectedId === p.id}
                    onChange={() => onSelect(p)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-blue checked:border-4 transition-all"
                  />
                </div>
                <div className="text-sm w-full">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">
                      {p.documentType} {p.documentNumber} {p.defaultProfile ? "• Predeterminado" : ""}
                    </div>
                    <button
                      onClick={(e) => toggleDetails(e, p.id)}
                      className="text-xs text-blue font-medium hover:underline ml-2 whitespace-nowrap flex items-center gap-1"
                    >
                      {expandedId === p.id ? "Ocultar" : "Ver detalle"}
                      <svg className={`w-3 h-3 transition-transform ${expandedId === p.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                  <div className="text-dark-5">
                    {p.taxCondition}
                    {p.businessName ? ` • ${p.businessName}` : ""}
                  </div>

                  {expandedId === p.id && (
                    <div className="mt-2 pt-2 border-t border-gray-2 text-xs text-dark-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Nombre:</span> {p.fullName}
                      </div>
                      {p.businessName && (
                        <div>
                          <span className="font-medium">Razón Social:</span> {p.businessName}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Condición:</span> {p.taxCondition}
                      </div>
                      <div>
                        <span className="font-medium">Doc:</span> {p.documentType} {p.documentNumber}
                      </div>
                      {p.emailForInvoices && (
                        <div className="sm:col-span-2">
                          <span className="font-medium">Email Facturas:</span> {p.emailForInvoices}
                        </div>
                      )}
                      {p.phone && (
                        <div>
                          <span className="font-medium">Teléfono:</span> {p.phone}
                        </div>
                      )}
                      {(() => {
                        const addr = addresses.find(a => a.id === p.billingAddressId);
                        if (!addr) return null;
                        return (
                          <div className="sm:col-span-2 mt-1 pt-1 border-t border-gray-2">
                            <span className="font-medium">Dirección:</span> {addr.street} {addr.streetNumber}, {addr.city} ({addr.postalCode}) - {addr.state}
                          </div>
                        );
                      })()}
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

export default BillingProfileList;
