// lib/services/registerService.ts
import { api } from "@/lib/api";

export type RegisterDto = { firstName: string; lastName: string; email: string; password: string; };
export type RegisteredUserDTO = { id: number | string; email: string; firstName: string; lastName: string; };
export type ServiceResult<T> = { message: string | null; data: T | null; status: string };

const base = "/register";

export const registerService = {
  register(body: RegisterDto) {
    return api.post<ServiceResult<RegisteredUserDTO>>(base, body);
  },
};
