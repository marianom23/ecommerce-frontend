"use client";
import { useAuthContext } from "@/app/context/AuthContext";

export function useAuth() {
  return useAuthContext();
}
