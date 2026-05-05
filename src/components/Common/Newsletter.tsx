"use client";

import React, { useState } from "react";
import Image from "next/image";
import { newsletterService } from "@/services/newsletterService";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await newsletterService.subscribe(email);
      setStatus("success");
      setMessage(
        response.alreadySubscribed
          ? "Ya estabas suscripto. Te vamos a avisar cuando haya novedades."
          : "Listo. Te suscribiste para recibir ofertas y novedades."
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("No pudimos registrar tu email. Proba de nuevo en unos segundos.");
    }
  };

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl">
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="ilustracion de fondo"
            className="absolute -z-1 w-full h-full left-0 top-0 rounded-xl object-cover"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                No te pierdas las ultimas tendencias y ofertas
              </h2>
              <p className="text-white">
                Registrate para recibir novedades sobre las ultimas ofertas y
                codigos de descuento
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    name="email"
                    id="newsletter-email"
                    placeholder="Ingresa tu correo electronico"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status !== "idle") {
                        setStatus("idle");
                        setMessage("");
                      }
                    }}
                    required
                    className="w-full bg-gray-1 border border-gray-3 outline-none rounded-md placeholder:text-dark-4 py-3 px-5"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "loading" ? "Enviando..." : "Suscribirme"}
                  </button>
                </div>

                {message && (
                  <p
                    className={`mt-3 text-sm ${
                      status === "success" ? "text-white" : "text-red-100"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
