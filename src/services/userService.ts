import { api } from "@/lib/api";
import { MeResponse } from "./authService";

export type UpdateProfileRequest = {
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
};

export type ChangePasswordRequest = {
    currentPassword?: string; // Opcional si el backend lo maneja así, pero usualmente es requerido
    newPassword?: string;
    confirmNewPassword?: string;
};

export const userService = {
    updateProfile(payload: UpdateProfileRequest) {
        return api.put<MeResponse>("/me/profile", payload);
    },

    changePassword(payload: ChangePasswordRequest) {
        return api.post<void>("/me/password", payload);
    },
};
