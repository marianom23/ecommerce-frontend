"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { resetCart, fetchCartGuest, fetchCartLogged } from "@/redux/features/cart-slice";
import { useAuth } from "@/hooks/useAuth"; // 👈 tu nuevo hook

export default function CartBootstrapper() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Todavía consultando /b/me

    // Limpiar estado anterior para evitar mezclas
    dispatch(resetCart());

    if (isAuthenticated) {
      void dispatch(fetchCartLogged());   // /b/cart/me
    } else {
      void dispatch(fetchCartGuest());    // /p/cart/me
    }
  }, [isAuthenticated, loading, dispatch]);

  return null;
}
