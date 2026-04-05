import { api } from "@/lib/api";

export type Console = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
};

const base = "/consoles";

export const consoleService = {
  list() {
    return api.get<Console[]>(base);
  },
  getOne(id: number) {
    return api.get<Console>(`${base}/${id}`);
  },
};
