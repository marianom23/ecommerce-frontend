"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchCartGuest, fetchCartLogged } from "@/redux/features/cart-slice";

export default function CartBootstrapper() {
  const { status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      void dispatch(fetchCartLogged());  // -> /b/cart/me
    } else if (status === "unauthenticated") {
      void dispatch(fetchCartGuest());   // -> /p/cart/me
    }
  }, [status, dispatch]);

  return null;
}
