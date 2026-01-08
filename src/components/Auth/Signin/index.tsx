// app/login/page.tsx  (tu Signin actual)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { authService } from "@/services/authService";
import { GoogleLogin } from '@react-oauth/google';
import { msalInstance } from "@/lib/msalConfig";

const sanitizeNext = (raw: string | null): string => {
  if (!raw) return "/";
  try {
    // Solo permitimos paths relativos internos
    const url = decodeURIComponent(raw);
    if (url.startsWith("/") && !url.startsWith("//")) return url;
  } catch { }
  return "/";
};

const Signin = () => {
  const params = useSearchParams();
  const next = sanitizeNext(params.get("next")); // 👈 destino dinámico

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Por favor ingresa tu email y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      // NOTE: authService.login ya guarda el token en localStorage como 'auth_token'
      // No necesitamos guardarlo de nuevo aquí

      window.location.href = next; // redirige
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Google OAuth client-side
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);

    try {
      await authService.oauthCallback({
        idToken: credentialResponse.credential,
        provider: 'GOOGLE'
      });

      // Token ya guardado en localStorage por authService.oauthCallback
      window.location.href = next;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión con Google");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Error al iniciar sesión con Google");
    setLoading(false);
  };

  // ✅ NUEVO: Microsoft OAuth client-side
  const handleMicrosoftLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["openid", "profile", "email"]
      });

      await authService.oauthCallback({
        idToken: loginResponse.idToken,
        provider: 'AZURE_AD'
      });

      // Token ya guardado en localStorage
      window.location.href = next;
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión con Microsoft");
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Ingresar"} pages={["Ingresar"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Inicia sesión en tu cuenta
              </h2>
              <p>Ingresa tus datos a continuación</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">Email</label>
                <input
                  type="email" name="email" id="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="Escribe tu email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">Contraseña</label>
                <input
                  type="password" name="password" id="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Escribe tu contraseña"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Ingresar a mi cuenta"}
              </button>

              <a
                href="#"
                className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
              >
                ¿Olvidaste tu contraseña?
              </a>

              <span className="relative z-1 block font-medium text-center mt-4.5">
                <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                <span className="inline-block px-3 bg-white">O</span>
              </span>

              <div className="flex flex-col gap-4.5 mt-4.5">
                {/* Google Login Button */}
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    text="signin_with"
                    shape="rectangular"
                    size="large"
                    width="100%"
                    theme="outline"
                  />
                </div>

                {/* Microsoft Login Button */}
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 hover:bg-gray-2 disabled:opacity-60"
                  disabled={loading}
                >
                  {/* SVG Microsoft */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="0" y="0" width="11" height="11" fill="#F04E23" />
                    <rect x="13" y="0" width="11" height="11" fill="#7DB700" />
                    <rect x="0" y="13" width="11" height="11" fill="#00A4EF" />
                    <rect x="13" y="13" width="11" height="11" fill="#FFB900" />
                  </svg>
                  Ingresa con Microsoft
                </button>
              </div>

              <p className="text-center mt-6">
                No tienes cuenta?
                <Link
                  href="/signup"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >                  ¡Regístrate ahora!
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
