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
import { AddressResponse, addressService } from "@/services/addressService";
import BillingForm from "./BillingForm";
import toast from "react-hot-toast";
import Modal from "@/components/Common/Modal";

const docTypes: DocumentType[] = ["CUIT", "CUIL", "DNI", "PAS"];
const taxOptions: TaxCondition[] = [
  "CONSUMIDOR_FINAL",
  "MONOTRIBUTO",
  "RESPONSABLE_INSCRIPTO",
  "EXENTO",
];

const BillingProfileForm: React.FC<{
  initialData?: BillingProfileResponse;
  billingAddresses?: AddressResponse[];
  shippingAddress?: AddressResponse | null;
  onSaved: (bp: BillingProfileResponse) => void;
  onCancel?: () => void;
}> = ({ initialData, billingAddresses, shippingAddress, onSaved, onCancel }) => {
  const [form, setForm] = useState<BillingProfileRequest>({
    documentType: "DNI",
    documentNumber: "",
    taxCondition: "CONSUMIDOR_FINAL",
    fullName: "",
    businessName: "",
    emailForInvoices: "",
    phone: "",
    billingAddressId: 0,
    isDefault: false,
  });

  const [localAddresses, setLocalAddresses] = useState<AddressResponse[]>(billingAddresses || []);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [copying, setCopying] = useState(false);

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
    }
  }, [initialData]);

  // Sync prop changes to local state if needed (optional, but good practice)
  useEffect(() => {
    if (billingAddresses) {
      setLocalAddresses(billingAddresses);
    }
  }, [billingAddresses]);

  // Auto-select first address if none selected and not editing
  useEffect(() => {
    if (!initialData && !form.billingAddressId && localAddresses.length > 0) {
      setForm(prev => ({ ...prev, billingAddressId: localAddresses[0].id }));
    }
  }, [localAddresses, initialData, form.billingAddressId]);

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

  const handleUseShipping = async () => {
    if (!shippingAddress) return;
    setCopying(true);
    try {
      // Check if exists in local list
      const found = localAddresses.find(a =>
        a.street === shippingAddress.street &&
        a.streetNumber === shippingAddress.streetNumber &&
        a.city === shippingAddress.city &&
        a.postalCode === shippingAddress.postalCode
      );

      if (found) {
        setForm(prev => ({ ...prev, billingAddressId: found.id }));
        toast.success("Dirección de envío seleccionada");
      } else {
        // Create new
        const created = await addressService.create({
          street: shippingAddress.street,
          streetNumber: shippingAddress.streetNumber,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          apartmentNumber: shippingAddress.apartmentNumber,
          floor: shippingAddress.floor,
          type: "BILLING"
        });
        setLocalAddresses(prev => [...prev, created]);
        setForm(prev => ({ ...prev, billingAddressId: created.id }));
        toast.success("Dirección de envío copiada y seleccionada");
      }
    } catch (error) {
      toast.error("Error al copiar dirección");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="bg-gray-1 rounded-[10px] p-4 sm:p-6 relative">
      <h3 className="font-medium text-dark mb-4">
        {initialData ? "Editar perfil de facturación" : "Nuevo perfil de facturación"}
      </h3>

      {err && <div className="text-red-500 text-sm mb-3">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-dark mb-1">Tipo de Documento</label>
          <select
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
            value={form.documentType}
            onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentType })}
          >
            {docTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Número de Documento</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.documentNumber}
            onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
            placeholder="Ej: 20123456789"
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Condición Fiscal</label>
          <select
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
            value={form.taxCondition}
            onChange={(e) => setForm({ ...form, taxCondition: e.target.value as TaxCondition })}
          >
            {taxOptions.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Nombre Completo / Razón Social</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.fullName || ""}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Nombre Apellido"
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Nombre de Fantasía (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.businessName || ""}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Email para Facturas (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.emailForInvoices || ""}
            onChange={(e) => setForm({ ...form, emailForInvoices: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-dark mb-1">Teléfono (opcional)</label>
          <input
            className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Address Selection */}
        <div className="sm:col-span-2 border-t border-gray-3 pt-4 mt-2">
          <label className="block text-sm font-medium text-dark mb-2">Dirección de Facturación</label>

          <div className="flex flex-col gap-3">
            {localAddresses.length > 0 && !isCreatingAddress && (
              <select
                className="w-full border border-gray-4 rounded px-3 py-2 text-sm focus:border-blue outline-none bg-white"
                value={form.billingAddressId}
                onChange={(e) => setForm({ ...form, billingAddressId: Number(e.target.value) })}
              >
                {localAddresses.map(addr => (
                  <option key={addr.id} value={addr.id}>
                    {addr.street} {addr.streetNumber}, {addr.city}
                  </option>
                ))}
              </select>
            )}

            {!isCreatingAddress && (
              <div className="flex flex-wrap gap-3">
                {shippingAddress && (
                  <button
                    type="button"
                    onClick={handleUseShipping}
                    disabled={copying}
                    className="text-sm text-blue hover:underline"
                  >
                    {copying ? "Copiando..." : "Usar misma dirección de envío"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsCreatingAddress(true)}
                  className="text-sm text-blue hover:underline"
                >
                  + Agregar nueva dirección
                </button>
              </div>
            )}
          </div>
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
          disabled={loading || !form.documentNumber || !form.fullName || !form.billingAddressId}
          className="px-6 py-2 bg-blue text-white text-sm font-medium rounded hover:bg-blue-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* Modal Address Form */}
      <Modal
        isOpen={isCreatingAddress}
        onClose={() => setIsCreatingAddress(false)}
        title="Nueva dirección"
      >
        <BillingForm
          onSaved={(newAddr) => {
            setLocalAddresses(prev => [...prev, newAddr]);
            setForm(prev => ({ ...prev, billingAddressId: newAddr.id }));
            setIsCreatingAddress(false);
            toast.success("Dirección creada y seleccionada");
          }}
          onCancel={() => setIsCreatingAddress(false)}
        />
      </Modal>
    </div>
  );
};

export default BillingProfileForm;
