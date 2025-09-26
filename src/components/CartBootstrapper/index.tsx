// components/CartBootstrapper.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchCart, attachCart } from "@/redux/features/cart-slice";

// ⬇️ Hook tipado desde tu redux/hooks (o redux/store si lo exportás ahí)
import { useAppDispatch } from "@/redux/hooks"; 
// Alternativa sin hook dedicado:
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "@/redux/store";

export default function CartBootstrapper() {
  const dispatch = useAppDispatch();
  // const dispatch = useDispatch<AppDispatch>(); // ← alternativa

  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const booted = useRef(false);

  // 1) Primera carga
  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      void dispatch(fetchCart());
    }
  }, [dispatch]);

  // 2) Al autenticarse: adjunta y refresca
  useEffect(() => {
    if (status === "authenticated") {
      void dispatch(attachCart()).then(() => {
        void dispatch(fetchCart());
      });
    }
  }, [status, dispatch]);

  // 3) Re-sync al navegar (ruta o query)
  useEffect(() => {
    if (booted.current) {
      void dispatch(fetchCart());
    }
  }, [pathname, searchParams, dispatch]);

  // 4) Re-sync al volver el foco a la pestaña
  useEffect(() => {
    const onFocus = () => { void dispatch(fetchCart()); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dispatch]);

  return null;
}
