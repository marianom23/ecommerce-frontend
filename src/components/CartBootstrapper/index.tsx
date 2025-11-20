"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchCartGuest, fetchCartLogged } from "@/redux/features/cart-slice";
import { useAuth } from "@/hooks/useAuth"; // 👈 tu nuevo hook

export default function CartBootstrapper() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Todavía consultando /b/me

    if (isAuthenticated) {
      void dispatch(fetchCartLogged());   // /b/cart/me
    } else {
      void dispatch(fetchCartGuest());    // /p/cart/me
    }
  }, [isAuthenticated, loading, dispatch]);

  return null;
}
