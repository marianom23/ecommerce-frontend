// components/Checkout/BillingProfileForm.tsx
"use client";
import React, { useState } from "react";
import {
  BillingProfileRequest,
  BillingProfileResponse,
  DocumentType,
  TaxCondition,
  billingProfileService,
} from "@/services/billingProfileService";

const docTypes: DocumentType[] = ["CUIT", "CUIL", "DNI", "PAS"];
const taxOptions: TaxCondition[] = [
  "CONSUMIDOR_FINAL",
  "MONOTRIBUTO",
  "RESPONSABLE_INSCRIPTO",
  "EXENTO",
];

const BillingProfileForm: React.FC<{
  billingAddressId: number;
  onSaved: (bp: BillingProfileResponse) => void;
  onCancel?: () => void;
}> = ({ billingAddressId, onSaved, onCancel }) => {
  const [form, setForm] = useState<BillingProfileRequest>({
    documentType: "DNI",
    documentNumber: "",
    taxCondition: "CONSUMIDOR_FINAL",
    fullName: "",                // 👈 NUEVO
    businessName: "",
    emailForInvoices: "",
    phone: "",
    billingAddressId,
    isDefault: true,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const created = await billingProfileService.create(form);
      onSaved(created);
    } catch (e: any) {
      setErr(e?.message || "No se pudo crear el perfil de facturación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg text-dark">Perfil de Facturación</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-blue text-sm">
            Cancelar
          </button>
        )}
      </div>

      {err && <p className="mb-4 text-red-600 text-sm">{err}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block mb-2.5">Nombre y Apellido *</label>
          <input
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.fullName ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="block mb-2.5">Tipo de documento *</label>
          <select
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.documentType}
            onChange={(e) =>
              setForm((f) => ({ ...f, documentType: e.target.value as DocumentType }))
            }
          >
            {docTypes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2.5">Número *</label>
          <input
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.documentNumber}
            onChange={(e) => setForm((f) => ({ ...f, documentNumber: e.target.value }))}
            placeholder="Documento"
            required
          />
        </div>

        <div>
          <label className="block mb-2.5">Condición fiscal *</label>
          <select
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.taxCondition}
            onChange={(e) =>
              setForm((f) => ({ ...f, taxCondition: e.target.value as TaxCondition }))
            }
          >
            {taxOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2.5">Razón Social</label>
          <input
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.businessName ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="block mb-2.5">Email para facturas</label>
          <input
            type="email"
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.emailForInvoices ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, emailForInvoices: e.target.value }))
            }
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="block mb-2.5">Teléfono</label>
          <input
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none"
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Opcional"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={loading || !form.documentNumber || !form.fullName}
        className="w-full inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-6 rounded-md mt-5 disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar perfil de facturación"}
      </button>
    </div>
  );
};

export default BillingProfileForm;
