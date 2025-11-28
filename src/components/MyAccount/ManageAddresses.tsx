"use client";

import React, { useEffect, useState } from "react";
import { addressService, AddressResponse } from "@/services/addressService";
import { billingProfileService, BillingProfileResponse } from "@/services/billingProfileService";
import ShippingForm from "../Checkout/ShippingForm";
import BillingProfileForm from "../Checkout/BillingProfileForm";
import toast from "react-hot-toast";

export default function ManageAddresses() {
    // Estado para direcciones de envío
    const [shippingList, setShippingList] = useState<AddressResponse[]>([]);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingMode, setShippingMode] = useState<"list" | "form">("list");
    const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
    const [editingShipping, setEditingShipping] = useState<AddressResponse | undefined>(undefined);

    // Estado para direcciones de facturación
    const [billingAddresses, setBillingAddresses] = useState<AddressResponse[]>([]);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [billingMode, setBillingMode] = useState<"list" | "form">("list");
    const [selectedBilling, setSelectedBilling] = useState<number | null>(null);
    const [editingBilling, setEditingBilling] = useState<AddressResponse | undefined>(undefined);

    // Estado para perfiles de facturación
    const [profilesList, setProfilesList] = useState<BillingProfileResponse[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [profileMode, setProfileMode] = useState<"list" | "form">("list");
    const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
    const [editingProfile, setEditingProfile] = useState<BillingProfileResponse | undefined>(undefined);

    // Cargar direcciones de envío
    async function loadShipping() {
        setLoadingShipping(true);
        try {
            const res = await addressService.list("SHIPPING");
            setShippingList(res);
            if (res.length > 0 && !selectedShipping) {
                setSelectedShipping(res[0].id);
            }
        } catch (error) {
            console.error("Error loading shipping addresses:", error);
            toast.error("Error al cargar direcciones de envío");
        } finally {
            setLoadingShipping(false);
        }
    }

    // Cargar direcciones de facturación
    async function loadBillingAddresses() {
        setLoadingBilling(true);
        try {
            const res = await addressService.list("BILLING");
            setBillingAddresses(res);
            if (res.length > 0 && !selectedBilling) {
                setSelectedBilling(res[0].id);
            }
        } catch (error) {
            console.error("Error loading billing addresses:", error);
        } finally {
            setLoadingBilling(false);
        }
    }

    // Cargar perfiles de facturación
    async function loadProfiles() {
        setLoadingProfiles(true);
        try {
            const res = await billingProfileService.listMine();
            setProfilesList(res);
            if (res.length > 0 && !selectedProfile) {
                setSelectedProfile(res[0].id);
            }
        } catch (error) {
            console.error("Error loading billing profiles:", error);
            toast.error("Error al cargar perfiles de facturación");
        } finally {
            setLoadingProfiles(false);
        }
    }

    useEffect(() => {
        loadShipping();
        loadBillingAddresses();
        loadProfiles();
    }, []);

    // Eliminar dirección
    async function deleteAddress(id: number, type: "SHIPPING" | "BILLING") {
        if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;
        try {
            await addressService.remove(id);
            toast.success("Dirección eliminada");
            if (type === "SHIPPING") {
                if (selectedShipping === id) setSelectedShipping(null);
                loadShipping();
            } else {
                if (selectedBilling === id) setSelectedBilling(null);
                loadBillingAddresses();
            }
        } catch (error) {
            toast.error("No se pudo eliminar la dirección");
        }
    }

    // Eliminar perfil de facturación
    async function deleteProfile(id: number) {
        if (!confirm("¿Estás seguro de eliminar este perfil?")) return;
        try {
            await billingProfileService.remove(id);
            toast.success("Perfil eliminado");
            if (selectedProfile === id) {
                setSelectedProfile(null);
            }
            loadProfiles();
        } catch (error) {
            toast.error("No se pudo eliminar el perfil");
        }
    }

    return (
        <div className="space-y-8">
            {/* Sección de direcciones de envío */}
            <div className="bg-white shadow-1 rounded-xl">
                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                    <h2 className="font-medium text-xl text-dark">
                        Direcciones de Envío
                    </h2>
                </div>

                {loadingShipping ? (
                    <p className="p-4 sm:p-7.5 text-dark-5">Cargando direcciones de envío...</p>
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
                    <div className="p-4 sm:p-7.5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-dark">Mis direcciones de envío</h3>
                            <button
                                onClick={() => {
                                    setEditingShipping(undefined);
                                    setShippingMode("form");
                                }}
                                className="text-blue text-sm font-medium hover:underline"
                            >
                                Agregar nueva
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
                                            className={`border rounded-md p-4 hover:border-blue transition-colors cursor-pointer ${selectedShipping === addr.id ? "border-blue bg-blue/5" : "border-gray-3"
                                                }`}
                                            onClick={() => setSelectedShipping(addr.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    checked={selectedShipping === addr.id}
                                                    onChange={() => setSelectedShipping(addr.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-dark">
                                                        {addr.street} {addr.streetNumber}
                                                    </div>
                                                    <div className="text-sm text-dark-5">
                                                        {addr.city} (C.P. {addr.postalCode}), {addr.state} {addr.postalCode && `(${addr.postalCode})`} • {addr.country}
                                                    </div>
                                                </div>
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
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedShipping && (
                                    <div className="mt-4 pt-4 border-t border-gray-3">
                                        <div className="text-sm">
                                            <button
                                                onClick={() => deleteAddress(selectedShipping, "SHIPPING")}
                                                className="text-red text-sm hover:underline"
                                            >
                                                Eliminar seleccionada
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Sección de direcciones de facturación */}
            <div className="bg-white shadow-1 rounded-xl">
                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                    <h2 className="font-medium text-xl text-dark">
                        Direcciones de Facturación
                    </h2>
                </div>

                {loadingBilling ? (
                    <p className="p-4 sm:p-7.5 text-dark-5">Cargando direcciones de facturación...</p>
                ) : billingMode === "form" ? (
                    <div className="p-4 sm:p-7.5">
                        <ShippingForm
                            initialData={editingBilling}
                            type="BILLING"
                            onSaved={async () => {
                                await loadBillingAddresses();
                                setBillingMode("list");
                                setEditingBilling(undefined);
                                toast.success("Dirección guardada");
                            }}
                            onCancel={() => {
                                setBillingMode("list");
                                setEditingBilling(undefined);
                            }}
                        />
                    </div>
                ) : (
                    <div className="p-4 sm:p-7.5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-dark">Mis direcciones de facturación</h3>
                            <button
                                onClick={() => {
                                    setEditingBilling(undefined);
                                    setBillingMode("form");
                                }}
                                className="text-blue text-sm font-medium hover:underline"
                            >
                                Agregar nueva
                            </button>
                        </div>

                        {billingAddresses.length === 0 ? (
                            <p className="text-dark-5 text-sm">No hay direcciones de facturación</p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {billingAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`border rounded-md p-4 hover:border-blue transition-colors cursor-pointer ${selectedBilling === addr.id ? "border-blue bg-blue/5" : "border-gray-3"
                                                }`}
                                            onClick={() => setSelectedBilling(addr.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    checked={selectedBilling === addr.id}
                                                    onChange={() => setSelectedBilling(addr.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-dark">
                                                        {addr.street} {addr.streetNumber}
                                                    </div>
                                                    <div className="text-sm text-dark-5">
                                                        {addr.city} (C.P. {addr.postalCode}), {addr.state} {addr.postalCode && `(${addr.postalCode})`} • {addr.country}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingBilling(addr);
                                                        setBillingMode("form");
                                                    }}
                                                    className="text-blue text-xs hover:underline"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedBilling && (
                                    <div className="mt-4 pt-4 border-t border-gray-3">
                                        <div className="text-sm">
                                            <button
                                                onClick={() => deleteAddress(selectedBilling, "BILLING")}
                                                className="text-red text-sm hover:underline"
                                            >
                                                Eliminar seleccionada
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Sección de perfiles de facturación */}
            <div className="bg-white shadow-1 rounded-xl">
                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                    <h2 className="font-medium text-xl text-dark">
                        Perfiles de Facturación
                    </h2>
                </div>

                {loadingProfiles ? (
                    <p className="p-4 sm:p-7.5 text-dark-5">Cargando perfiles de facturación...</p>
                ) : profileMode === "form" ? (
                    <div className="p-4 sm:p-7.5">
                        <BillingProfileForm
                            initialData={editingProfile}
                            billingAddresses={billingAddresses}
                            onSaved={async () => {
                                await loadProfiles();
                                setProfileMode("list");
                                setEditingProfile(undefined);
                                toast.success("Perfil guardado");
                            }}
                            onCancel={() => {
                                setProfileMode("list");
                                setEditingProfile(undefined);
                            }}
                        />
                    </div>
                ) : (
                    <div className="p-4 sm:p-7.5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-dark">Mis perfiles de facturación</h3>
                            <button
                                onClick={() => {
                                    setEditingProfile(undefined);
                                    setProfileMode("form");
                                }}
                                className="text-blue text-sm font-medium hover:underline"
                            >
                                Agregar nuevo
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
                                            className={`border rounded-md p-4 hover:border-blue transition-colors cursor-pointer ${selectedProfile === profile.id ? "border-blue bg-blue/5" : "border-gray-3"
                                                }`}
                                            onClick={() => setSelectedProfile(profile.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    checked={selectedProfile === profile.id}
                                                    onChange={() => setSelectedProfile(profile.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-dark">
                                                        {profile.documentType} {profile.documentNumber} • {profile.taxCondition === "CONSUMIDOR_FINAL" ? "Predeterminado" : profile.taxCondition}
                                                    </div>
                                                    <div className="text-sm text-dark-5">
                                                        {profile.fullName}
                                                        {profile.businessName && ` • ${profile.businessName}`}
                                                    </div>
                                                </div>
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
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedProfile && (
                                    <div className="mt-4 pt-4 border-t border-gray-3">
                                        <div className="text-sm">
                                            <div className="font-medium text-dark mb-2">
                                                {profilesList.find(p => p.id === selectedProfile)?.documentType} {profilesList.find(p => p.id === selectedProfile)?.documentNumber}
                                            </div>
                                            <div className="text-dark-5 mb-2">
                                                {profilesList.find(p => p.id === selectedProfile)?.fullName}
                                            </div>
                                            <button
                                                onClick={() => deleteProfile(selectedProfile)}
                                                className="text-red text-sm hover:underline"
                                            >
                                                Eliminar seleccionada
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
