// components/Checkout/BillingProfileForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  BillingProfileRequest,
  BillingProfileResponse,
  DocumentType,
  TaxCondition,
  billingProfileService,
} from "@/services/billingProfileService";
import { AddressResponse } from "@/services/addressService";

const docTypes: DocumentType[] = ["CUIT", "CUIL", "DNI", "PAS"];
const taxOptions: TaxCondition[] = [
  "CONSUMIDOR_FINAL",
  "MONOTRIBUTO",
  "RESPONSABLE_INSCRIPTO",
  "EXENTO",
];

const BillingProfileForm: React.FC<{
  initialData?: BillingProfileResponse;
  billingAddressId?: number; // Pre-selected or default
  billingAddresses?: AddressResponse[]; // List to choose from
  onSaved: (bp: BillingProfileResponse) => void;
  onCancel?: () => void;
}> = ({ initialData, billingAddressId, billingAddresses, onSaved, onCancel }) => {
  const [form, setForm] = useState<BillingProfileRequest>({
    documentType: "DNI",
    documentNumber: "",
    taxCondition: "CONSUMIDOR_FINAL",
    fullName: "",
    businessName: "",
    emailForInvoices: "",
    phone: "",
    billingAddressId: billingAddressId || 0,
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        documentType: initialData.documentType,
        documentNumber: initialData.documentNumber,
        taxCondition: initialData.taxCondition,
        fullName: initialData.fullName || "",
        businessName: initialData.businessName || "",
        emailForInvoices: initialData.emailForInvoices || "",
        phone: initialData.phone || "",
        billingAddressId: initialData.billingAddressId,
        isDefault: initialData.defaultProfile,
      });
    } else if (billingAddressId) {
      setForm(prev => ({ ...prev, billingAddressId }));
    }
  }, [initialData, billingAddressId]);

  // If billingAddresses list is provided but no ID selected yet, select first one
  useEffect(() => {
    if (!form.billingAddressId && billingAddresses && billingAddresses.length > 0) {
      setForm(prev => ({ ...prev, billingAddressId: billingAddresses[0].id }));
    }
  }, [billingAddresses]);

  async function save() {
    if (loading) return;
    if (!form.billingAddressId) {
      setErr("Debe seleccionar una dirección de facturación");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      let result: BillingProfileResponse;
      if (initialData) {
        result = await billingProfileService.update(initialData.id, form);
      } else {
        result = await billingProfileService.create(form);
      }
      onSaved(result);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-1 rounded-[10px] p-4 sm:p-6">
      <h3 className="font-medium text-dark mb-4">
        {initialData ? "Editar perfil de facturación" : "Nuevo perfil de facturación"}
      </h3>

      {err && <div className="text-red-500 text-sm mb-3">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-dark-5 mb-1">Tipo de Documento</label>
          <select
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
            value={form.documentType}
            onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentType })}
          >
            {docTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark-5 mb-1">Número de Documento</label>
          <input
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.documentNumber}
            onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
            placeholder="Ej: 20123456789"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-5 mb-1">Condición Fiscal</label>
          <select
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
            value={form.taxCondition}
            onChange={(e) => setForm({ ...form, taxCondition: e.target.value as TaxCondition })}
          >
            {taxOptions.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark-5 mb-1">Nombre Completo / Razón Social</label>
          <input
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.fullName || ""}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Nombre Apellido"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-5 mb-1">Nombre de Fantasía (opcional)</label>
          <input
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.businessName || ""}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark-5 mb-1">Email para Facturas (opcional)</label>
          <input
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.emailForInvoices || ""}
            onChange={(e) => setForm({ ...form, emailForInvoices: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark-5 mb-1">Teléfono (opcional)</label>
          <input
            className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Address Selection if list provided */}
        {billingAddresses && billingAddresses.length > 0 && (
          <div className="sm:col-span-2">
            <label className="block text-sm text-dark-5 mb-1">Dirección de Facturación</label>
            <select
              className="w-full border border-gray-3 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
              value={form.billingAddressId}
              onChange={(e) => setForm({ ...form, billingAddressId: Number(e.target.value) })}
            >
              {billingAddresses.map(addr => (
                <option key={addr.id} value={addr.id}>
                  {addr.street} {addr.streetNumber}, {addr.city}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-dark-5 hover:text-dark"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={save}
          disabled={loading || !form.documentNumber || !form.fullName}
          className="px-6 py-2 bg-blue text-white text-sm font-medium rounded hover:bg-blue-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
};

export default BillingProfileForm;
