"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema, PasswordSchema, profileSchema, ProfileSchema } from "@/lib/schemas";

export default function AccountDetails() {
    const { user } = useAuth();
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    // --- Profile Form ---
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        setValue: setProfileValue,
        formState: { errors: profileErrors },
    } = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user) {
            setProfileValue("firstName", user.firstName || "");
            setProfileValue("lastName", user.lastName || "");
        }
    }, [user, setProfileValue]);

    const onSubmitProfile = async (data: ProfileSchema) => {
        setLoadingProfile(true);
        try {
            await userService.updateProfile(data);
            toast.success("Perfil actualizado correctamente");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error al actualizar perfil");
        } finally {
            setLoadingProfile(false);
        }
    };

    // --- Password Form ---
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordSchema>({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmitPassword = async (data: PasswordSchema) => {
        setLoadingPassword(true);
        try {
            await userService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword,
            });
            toast.success("Contraseña actualizada correctamente");
            resetPassword();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error al cambiar contraseña");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Profile Form */}
            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
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
                                {...registerProfile("firstName")}
                                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20 ${profileErrors.firstName ? "border-red-500" : "border-gray-3"
                                    }`}
                            />
                            {profileErrors.firstName && (
                                <span className="text-red-500 text-sm mt-1">{profileErrors.firstName.message}</span>
                            )}
                        </div>

                        <div className="w-full">
                            <label htmlFor="lastName" className="block mb-2.5 text-dark">
                                Apellido <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                {...registerProfile("lastName")}
                                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20 ${profileErrors.lastName ? "border-red-500" : "border-gray-3"
                                    }`}
                            />
                            {profileErrors.lastName && (
                                <span className="text-red-500 text-sm mt-1">{profileErrors.lastName.message}</span>
                            )}
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
            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <h3 className="font-medium text-xl text-dark mb-7">Cambio de Contraseña</h3>

                    <div className="mb-5">
                        <label htmlFor="currentPassword" className="block mb-2.5 text-dark">
                            Contraseña Actual
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            {...registerPassword("currentPassword")}
                            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20 ${passwordErrors.currentPassword ? "border-red-500" : "border-gray-3"
                                }`}
                        />
                        {passwordErrors.currentPassword && (
                            <span className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="newPassword" className="block mb-2.5 text-dark">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            {...registerPassword("newPassword")}
                            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20 ${passwordErrors.newPassword ? "border-red-500" : "border-gray-3"
                                }`}
                        />
                        {passwordErrors.newPassword && (
                            <span className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="confirmNewPassword" className="block mb-2.5 text-dark">
                            Confirmar Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            {...registerPassword("confirmNewPassword")}
                            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20 ${passwordErrors.confirmNewPassword ? "border-red-500" : "border-gray-3"
                                }`}
                        />
                        {passwordErrors.confirmNewPassword && (
                            <span className="text-red-500 text-sm mt-1">{passwordErrors.confirmNewPassword.message}</span>
                        )}
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
