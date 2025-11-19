// components/Checkout/BillingProfileList.tsx
"use client";
import React from "react";
import { BillingProfileResponse, billingProfileService } from "@/services/billingProfileService";

const BillingProfileList: React.FC<{
  title: string;
  loading: boolean;
  profiles: BillingProfileResponse[];
  selectedId: number | null;
  onSelect: (bp: BillingProfileResponse | null) => void;
  onAddNew: () => void;
}> = ({ title, loading, profiles, selectedId, onSelect, onAddNew }) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg text-dark">{title}</h3>
        <button type="button" className="text-blue text-sm" onClick={onAddNew}>
          Agregar nuevo
        </button>
      </div>

      {loading && <p className="text-sm text-dark-5">Cargando...</p>}

      {!loading && !profiles.length && (
        <p className="text-sm text-dark-5">No tenés perfiles de facturación guardados.</p>
      )}

      {!loading && profiles.length > 0 && (
        <div className="space-y-3">
          {profiles.map((p) => (
            <label key={p.id} className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:border-blue/60 ${selectedId === p.id ? "border-blue" : "border-gray-3"}`}>
              <input
                type="radio"
                name="billing-profile"
                checked={selectedId === p.id}
                onChange={() => onSelect(p)}
                className="mt-1"
              />
              <div className="text-sm">
                <div className="font-medium">
                  {p.documentType} {p.documentNumber} {p.defaultProfile ? "• Predeterminado" : ""}
                </div>
                <div className="text-dark-5">
                  {p.taxCondition}
                  {p.businessName ? ` • ${p.businessName}` : ""}
                  {p.emailForInvoices ? ` • ${p.emailForInvoices}` : ""}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingProfileList;
