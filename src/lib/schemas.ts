import { z } from "zod";

// --- Address Schema ---
export const addressSchema = z.object({
    street: z.string().min(1, "La calle es obligatoria"),
    streetNumber: z.string().min(1, "La altura es obligatoria"),
    floor: z.string().optional(),
    apartmentNumber: z.string().optional(),
    city: z.string().min(1, "La ciudad es obligatoria"),
    state: z.string().min(1, "La provincia/estado es obligatoria"), // Opcional si el backend lo permite, pero mejor pedirlo
    postalCode: z.string().min(1, "El código postal es obligatorio"),
    country: z.string(),
    //type se maneja generalmente por props o estado oculto, pero podemos validarlo si es necesario
    type: z.enum(["SHIPPING", "BILLING"]).optional(),
});

export type AddressSchema = z.infer<typeof addressSchema>;


// --- Profile Schema ---
export const profileSchema = z.object({
    firstName: z.string().min(1, "El nombre es obligatorio"),
    lastName: z.string().min(1, "El apellido es obligatorio"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;


// --- Password Schema ---
export const passwordSchema = z.object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmNewPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
});

export type PasswordSchema = z.infer<typeof passwordSchema>;
