"use client";

import React, { useEffect, useState } from "react";
import { addressService, AddressResponse } from "@/services/addressService";
import { billingProfileService, BillingProfileResponse } from "@/services/billingProfileService";
import ShippingForm from "../Checkout/ShippingForm";
import BillingProfileForm from "../Checkout/BillingProfileForm";

import toast from "react-hot-toast";
import Modal from "../Common/Modal";
import { OrderListSkeleton } from "@/components/Common/Skeletons";

const getBillingProfileSummary = (profile: BillingProfileResponse) => {
    const taxLabel = profile.taxCondition === "CONSUMIDOR_FINAL" ? "Predeterminado" : profile.taxCondition;
    const documentLabel = profile.documentNumber
        ? `${profile.documentType || "Doc."} ${profile.documentNumber}`
        : "Documento no informado";

    return `${documentLabel} • ${taxLabel}`;
};

export default function ManageAddresses() {
    // Estado para direcciones de envío
    const [shippingList, setShippingList] = useState<AddressResponse[]>([]);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingMode, setShippingMode] = useState<"list" | "form">("list");
    const [editingShipping, setEditingShipping] = useState<AddressResponse | undefined>(undefined);

    // Estado para perfiles de facturación
    const [profilesList, setProfilesList] = useState<BillingProfileResponse[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [profileMode, setProfileMode] = useState<"list" | "form">("list");
    const [editingProfile, setEditingProfile] = useState<BillingProfileResponse | undefined>(undefined);

    // Estados para "Ver detalle"
    const [expandedShippingId, setExpandedShippingId] = useState<number | null>(null);
    const [expandedProfileId, setExpandedProfileId] = useState<number | null>(null);

    // Estado para confirmación de eliminación
    const [deletingItem, setDeletingItem] = useState<{ id: number; type: "SHIPPING" | "PROFILE" } | null>(null);

    // Cargar direcciones de envío
    async function loadShipping() {
        setLoadingShipping(true);
        try {
            const res = await addressService.list("SHIPPING");
            setShippingList(res);
        } catch (error) {
            console.error("Error loading shipping addresses:", error);
            toast.error("Error al cargar direcciones de envío");
        } finally {
            setLoadingShipping(false);
        }
    }

    // Cargar perfiles de facturación
    async function loadProfiles() {
        setLoadingProfiles(true);
        try {
            const res = await billingProfileService.listMine();
            setProfilesList(res);
        } catch (error) {
            console.error("Error loading billing profiles:", error);
            toast.error("Error al cargar perfiles de facturación");
        } finally {
            setLoadingProfiles(false);
        }
    }

    useEffect(() => {
        loadShipping();
        loadProfiles();
    }, []);

    // Eliminar dirección
    async function deleteAddress(id: number) {
        setDeletingItem({ id, type: "SHIPPING" });
    }

    async function confirmDeleteAddress() {
        if (!deletingItem) return;
        const { id } = deletingItem;

        try {
            await addressService.remove(id);
            toast.success("Dirección eliminada");
            loadShipping();
        } catch (error: any) {
            let msg = error?.response?.data?.message;
            if (!msg || msg.includes("constraint") || msg.includes("DataIntegrityViolation") || error?.response?.status === 409) {
                msg = "No se puede borrar porque la dirección está asociada a un pedido o perfil.";
            }
            toast.error(msg);
        } finally {
            setDeletingItem(null);
        }
    }

    // Eliminar perfil de facturación
    async function deleteProfile(id: number) {
        setDeletingItem({ id, type: "PROFILE" });
    }

    async function confirmDeleteProfile() {
        if (!deletingItem) return;
        const { id } = deletingItem;

        try {
            await billingProfileService.remove(id);
            toast.success("Perfil eliminado");
            loadProfiles();
        } catch (error: any) {
            const msg = error?.response?.data?.message || "No se pudo eliminar el perfil";
            toast.error(msg);
        } finally {
            setDeletingItem(null);
        }
    }

    return (
        <div className="space-y-8">
            {/* Sección de direcciones de envío */}
            <div className="bg-white shadow-1 rounded-[10px]">
                <div className="flex items-center justify-between py-5 px-4 sm:px-8.5 border-b border-gray-3">
                    <h2 className="font-medium text-lg text-dark">
                        Direcciones de Envío
                    </h2>
                </div>

                {loadingShipping ? (
                    <OrderListSkeleton rows={2} />
                ) : shippingMode === "form" ? (
                    <div className="p-4 sm:p-7.5">
                        <ShippingForm
                            initialData={editingShipping}
                            type="SHIPPING"
                            onSaved={async () => {
                                await loadShipping();
                                setShippingMode("list");
                                setEditingShipping(undefined);
                                toast.success("Dirección guardada");
                            }}
                            onCancel={() => {
                                setShippingMode("list");
                                setEditingShipping(undefined);
                            }}
                        />
                    </div>
                ) : (
                    <div className="p-4 sm:p-8.5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-dark">Mis direcciones de envío</h3>
                            <button
                                onClick={() => {
                                    setEditingShipping(undefined);
                                    setShippingMode("form");
                                }}
                                className="text-xs font-medium bg-blue/10 text-blue px-3 py-1.5 rounded-full hover:bg-blue hover:text-white transition-colors"
                            >
                                + Agregar nueva
                            </button>
                        </div>

                        {shippingList.length === 0 ? (
                            <p className="text-dark-5 text-sm">No hay direcciones de envío</p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {shippingList.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className="flex items-start gap-3 p-4 border rounded-lg transition-all duration-200 border-gray-3 hover:border-blue/40"
                                        >
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-medium text-dark">
                                                        {addr.street} {addr.streetNumber} {addr.floor && `• Piso ${addr.floor}`} {addr.apartmentNumber && `• Depto ${addr.apartmentNumber}`}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedShippingId(expandedShippingId === addr.id ? null : addr.id);
                                                            }}
                                                            className="text-blue text-xs font-medium hover:underline flex items-center gap-1"
                                                        >
                                                            {expandedShippingId === addr.id ? "Ocultar" : "Ver detalle"}
                                                            <svg className={`w-3 h-3 transition-transform ${expandedShippingId === addr.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingShipping(addr);
                                                                setShippingMode("form");
                                                            }}
                                                            className="text-blue text-xs hover:underline"
                                                        >
                                                            Editar
                                                        </button>
                                                        <span className="text-gray-3 text-xs">|</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteAddress(addr.id);
                                                            }}
                                                            className="text-red-500 text-xs hover:underline"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-dark-5">
                                                    {addr.city} (C.P. {addr.postalCode}), {addr.state} {addr.postalCode && `(${addr.postalCode})`} • {addr.country}
                                                </div>

                                                {expandedShippingId === addr.id && (
                                                    <div className="mt-2 pt-2 border-t border-gray-2 text-xs text-dark-5 grid grid-cols-2 gap-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                                                        <div><span className="font-medium">Calle:</span> {addr.street}</div>
                                                        <div><span className="font-medium">Altura:</span> {addr.streetNumber}</div>
                                                        {addr.floor && <div><span className="font-medium">Piso:</span> {addr.floor}</div>}
                                                        {addr.apartmentNumber && <div><span className="font-medium">Depto:</span> {addr.apartmentNumber}</div>}
                                                        <div><span className="font-medium">Ciudad:</span> {addr.city}</div>
                                                        <div><span className="font-medium">Provincia:</span> {addr.state}</div>
                                                        <div><span className="font-medium">CP:</span> {addr.postalCode}</div>
                                                        <div><span className="font-medium">País:</span> {addr.country}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Sección de perfiles de facturación */}
            <div className="bg-white shadow-1 rounded-[10px]">
                <div className="flex items-center justify-between py-5 px-4 sm:px-8.5 border-b border-gray-3">
                    <h2 className="font-medium text-lg text-dark">
                        Perfiles de Facturación
                    </h2>
                </div>

                {loadingProfiles ? (
                    <OrderListSkeleton rows={2} />
                ) : profileMode === "form" ? (
                    <div className="p-4 sm:p-7.5">
                        <BillingProfileForm
                            initialData={editingProfile}
                            onSaved={async () => {
                                await loadProfiles();
                                setProfileMode("list");
                                setEditingProfile(undefined);
                            }}
                            onCancel={() => {
                                setProfileMode("list");
                                setEditingProfile(undefined);
                            }}
                        />
                    </div>
                ) : (
                    <div className="p-4 sm:p-8.5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-dark">Mis perfiles de facturación</h3>
                            <button
                                onClick={() => {
                                    setEditingProfile(undefined);
                                    setProfileMode("form");
                                }}
                                className="text-xs font-medium bg-blue/10 text-blue px-3 py-1.5 rounded-full hover:bg-blue hover:text-white transition-colors"
                            >
                                + Agregar nuevo
                            </button>
                        </div>

                        {profilesList.length === 0 ? (
                            <p className="text-dark-5 text-sm">No hay perfiles de facturación</p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {profilesList.map((profile) => (
                                        <div
                                            key={profile.id}
                                            className="flex items-start gap-3 p-4 border rounded-lg transition-all duration-200 border-gray-3 hover:border-blue/40"
                                        >
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-medium text-dark">
                                                        {getBillingProfileSummary(profile)}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedProfileId(expandedProfileId === profile.id ? null : profile.id);
                                                            }}
                                                            className="text-blue text-xs font-medium hover:underline flex items-center gap-1"
                                                        >
                                                            {expandedProfileId === profile.id ? "Ocultar" : "Ver detalle"}
                                                            <svg className={`w-3 h-3 transition-transform ${expandedProfileId === profile.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingProfile(profile);
                                                                setProfileMode("form");
                                                            }}
                                                            className="text-blue text-xs hover:underline"
                                                        >
                                                            Editar
                                                        </button>
                                                        {!profile.defaultProfile && (
                                                            <>
                                                                <span className="text-gray-3 text-xs">|</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteProfile(profile.id);
                                                                    }}
                                                                    className="text-red-500 text-xs hover:underline"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-dark-5">
                                                    {profile.fullName}
                                                    {profile.businessName && ` • ${profile.businessName}`}
                                                </div>

                                                {expandedProfileId === profile.id && (
                                                    <div className="mt-2 pt-2 border-t border-gray-2 text-xs text-dark-5 grid grid-cols-1 sm:grid-cols-2 gap-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                                                        <div><span className="font-medium">Nombre:</span> {profile.fullName}</div>
                                                        {profile.businessName && <div><span className="font-medium">Razón Social:</span> {profile.businessName}</div>}
                                                        <div><span className="font-medium">Condición:</span> {profile.taxCondition}</div>
                                                        {profile.documentNumber && <div><span className="font-medium">Doc:</span> {profile.documentType || "Doc."} {profile.documentNumber}</div>}
                                                        {profile.emailForInvoices && <div className="sm:col-span-2"><span className="font-medium">Email Facturas:</span> {profile.emailForInvoices}</div>}
                                                        {profile.phone && <div><span className="font-medium">Teléfono:</span> {profile.phone}</div>}
                                                        {profile.city && (
                                                            <div className="sm:col-span-2 mt-1 pt-1 border-t border-gray-2">
                                                                <span className="font-medium">Dirección:</span> {profile.street} {profile.streetNumber}, {profile.city} ({profile.postalCode}) - {profile.state}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Confirmación */}
            <Modal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                title="Confirmar eliminación"
                className="max-w-md"
            >
                <div className="text-center">
                    <p className="text-dark mb-6">
                        ¿Estás seguro de que querés eliminar {deletingItem?.type === "PROFILE" ? "este perfil" : "esta dirección"}?
                        <br />
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setDeletingItem(null)}
                            className="px-6 py-2.5 border border-gray-3 text-dark font-medium rounded hover:bg-gray-1 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                if (deletingItem?.type === "PROFILE") {
                                    confirmDeleteProfile();
                                } else {
                                    confirmDeleteAddress();
                                }
                            }}
                            className="px-6 py-2.5 bg-red text-white font-medium rounded hover:bg-red-dark transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
