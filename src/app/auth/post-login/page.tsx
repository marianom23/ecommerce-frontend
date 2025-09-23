"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { cartService } from "@/services/cartService";

export default function PostLogin() {
  const router = useRouter();
  const { status } = useSession(); // 'loading' | 'authenticated' | 'unauthenticated'
  const ran = useRef(false);
  const [error, setError] = useState<string>("");

  // Podés pasar destino: /auth/post-login?to=/checkout
  const params = useSearchParams();
  const to = params.get("to") || "/";

  useEffect(() => {
    if (status !== "authenticated") return;
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        await cartService.get(); 
        await cartService.attachCart(); // idempotente en backend
      } catch (e: any) {
        console.error("attachCart failed:", e);
        setError("No se pudo adjuntar el carrito (continuamos igual).");
      } finally {
        router.replace(to);
      }
    })();
  }, [status, router, to]);

  return (
    <section className="py-20">
      <div className="max-w-[560px] mx-auto text-center px-4">
        <h2 className="text-2xl font-semibold mb-3">Conectando tu cuenta…</h2>
        <p className="text-dark-4">Estamos preparando tu carrito.</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </section>
  );
}
