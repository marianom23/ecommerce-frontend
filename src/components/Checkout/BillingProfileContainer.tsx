"use client";
import React, { useEffect, useState } from "react";
import BillingProfileForm from "./BillingProfileForm";
import { type OrderResponse, orderService } from "@/services/orderService";
import { type AddressResponse } from "@/services/addressService";
import { billingProfileService, type BillingProfileResponse } from "@/services/billingProfileService";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const BillingProfileContainer: React.FC<{
  order: OrderResponse | null;
  shippingAddress?: AddressResponse | null;
  onSelected?: (bp: any) => void;
}> = ({ order, shippingAddress, onSelected }) => {
  const { isAuthenticated, loading } = useAuth();
  
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<BillingProfileResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingProfile, setEditingProfile] = useState<BillingProfileResponse | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function loadProfiles() {
    setErr(null);
    setLoadingList(true);
    try {
      const res = await billingProfileService.listMine();
      setProfiles(res);

      if (res.length > 0) {
        setMode("list");
        // Auto select the default or first one
        const preselected = res.find((p) => p.defaultProfile) || res[0];
        setSelectedId(preselected.id);
        await applyToOrder(preselected, true);
      } else {
        setMode("form");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }

  async function applyToOrder(profile: BillingProfileResponse, silent = false) {
    if (!order?.orderNumber) return;
    setErr(null);
    setSaving(true);
    try {
      await orderService.patchBillingProfile(order.orderNumber, { billingProfileId: profile.id });
      if (!silent) {
        toast.success("Perfil de facturación aplicado ✓");
      }
      onSelected?.(profile);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Error al aplicar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (loading || !order?.orderNumber || hasLoaded) return;
    if (isAuthenticated) {
        setHasLoaded(true);
        loadProfiles();
    }
  }, [loading, isAuthenticated, order?.orderNumber, hasLoaded]);

  if (loading || loadingList) {
    return (
      <div className="mt-7.5">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Información de Facturación
        </h2>
        <p className="text-dark">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-7.5">
        <BillingProfileForm 
           order={order} 
           shippingAddress={shippingAddress} 
           onSelected={(data) => onSelected?.(data as any)} 
        />
      </div>
    );
  }

  return (
    <div className="mt-7.5 space-y-4">
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
          {err}
        </div>
      )}

      {mode === "list" && (
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
            <div className="flex items-center justify-between mb-4 border-b border-gray-3 pb-5">
                <h3 className="font-medium text-dark text-xl">Mis perfiles de facturación</h3>
                <button
                    onClick={() => {
                        setEditingProfile(null);
                        setMode("form");
                    }}
                    className="text-xs font-medium bg-blue/10 text-blue px-3 py-1.5 rounded-full hover:bg-blue hover:text-white transition-colors"
                >
                    + Agregar nuevo
                </button>
            </div>

            <div className="space-y-3">
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedId === profile.id
                            ? "border-blue bg-blue/5 shadow-sm"
                            : "border-gray-3 hover:border-blue/40"
                        } ${saving ? "opacity-50 pointer-events-none" : ""}`}
                        onClick={() => {
                            if (selectedId !== profile.id) {
                                setSelectedId(profile.id);
                                applyToOrder(profile);
                            }
                        }}
                    >
                        <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                            <input
                                type="radio"
                                checked={selectedId === profile.id}
                                readOnly
                                className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-blue checked:border-4 transition-all"
                            />
                        </div>
                        <div className="flex-1 text-sm">
                            <div className="font-medium text-dark mb-1">
                                {profile.documentType} {profile.documentNumber} • {profile.taxCondition === "CONSUMIDOR_FINAL" ? "Predeterminado" : profile.taxCondition}
                            </div>
                            <div className="text-dark-5">
                                {profile.fullName}
                                {profile.businessName && ` • ${profile.businessName}`}
                            </div>
                            {profile.city && (
                                <div className="text-dark-5 mt-1">
                                    {profile.street} {profile.streetNumber}, {profile.city}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingProfile(profile);
                                setMode("form");
                            }}
                            className="text-blue text-xs hover:underline mt-0.5"
                        >
                            Ver / Editar
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {mode === "form" && (
        <BillingProfileForm 
           order={order} 
           shippingAddress={shippingAddress} 
           initialData={editingProfile}
           onSelected={(data) => {
               // When form automatically saves, we just want to tell the parent it's selected.
               onSelected?.(data as any);
           }} 
           onSaved={(profile) => {
               // When explicitly saved, refresh the list and switch to it!
               setEditingProfile(null);
               loadProfiles(); 
           }}
           onCancel={profiles.length > 0 ? () => {
               setEditingProfile(null);
               setMode("list");
           } : undefined}
        />
      )}
    </div>
  );
};

export default BillingProfileContainer;
