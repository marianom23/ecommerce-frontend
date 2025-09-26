// components/CartBootstrapper.tsx
"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { fetchCart, attachCart } from "@/redux/features/cart-slice";
import { useAppDispatch } from "@/redux/hooks";

export default function CartBootstrapper() {
  const dispatch = useAppDispatch();
  const { status } = useSession();
  const booted = useRef(false);

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      void dispatch(fetchCart());
    }
  }, [dispatch]);

  useEffect(() => {
    if (status === "authenticated") {
      void dispatch(attachCart()).then(() => void dispatch(fetchCart()));
    }
  }, [status, dispatch]);

  return null;
}
