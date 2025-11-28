"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";

export default function AccountDetails() {
    const { user } = useAuth();

    // Profile State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            await userService.updateProfile({ firstName, lastName });
            toast.success("Perfil actualizado correctamente");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error al actualizar perfil");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }
        setLoadingPassword(true);
        try {
            await userService.changePassword({
                currentPassword,
                newPassword,
                confirmNewPassword: confirmNewPassword,
            });
            toast.success("Contraseña actualizada correctamente");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error: any) {
            // Mostrar mensaje específico del backend (ej: usuario de Google/Microsoft)
            toast.error(error?.response?.data?.message || "Error al cambiar contraseña");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <h3 className="font-medium text-xl text-dark mb-7">Detalles de la Cuenta</h3>

                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                        <div className="w-full">
                            <label htmlFor="firstName" className="block mb-2.5 text-dark">
                                Nombre <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20"
                                required
                            />
                        </div>

                        <div className="w-full">
                            <label htmlFor="lastName" className="block mb-2.5 text-dark">
                                Apellido <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loadingProfile}
                        className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70"
                    >
                        {loadingProfile ? "Guardando..." : "Guardar Cambios"}
                    </button>

                    <p className="text-custom-sm mt-5 text-dark-5">
                        Así es como se mostrará tu nombre en la sección de cuenta y en las reseñas.
                    </p>
                </div>
            </form>

            {/* Password Form */}
            <form onSubmit={handleChangePassword}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <h3 className="font-medium text-xl text-dark mb-7">Cambio de Contraseña</h3>

                    <div className="mb-5">
                        <label htmlFor="currentPassword" className="block mb-2.5 text-dark">
                            Contraseña Actual
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20"
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="newPassword" className="block mb-2.5 text-dark">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20"
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="confirmNewPassword" className="block mb-2.5 text-dark">
                            Confirmar Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loadingPassword}
                        className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70"
                    >
                        {loadingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                    </button>
                </div>
            </form>
        </div>
    );
}
