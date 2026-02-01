"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { registerService } from "@/services/RegisterService";
import { authService } from "@/services/authService";
import { GoogleLogin } from '@react-oauth/google';
import { msalInstance } from "@/lib/msalConfig";

const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const payload = await registerService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setSuccess(payload?.message ?? "Cuenta creada correctamente. Redirigiendo al inicio de sesión...");
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google OAuth
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);
    try {
      await authService.oauthCallback({
        idToken: credentialResponse.credential,
        provider: 'GOOGLE'
      });
      // Redirigir al inicio tras registro/login exitoso
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrarse con Google");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Error al conectarse con Google");
    setLoading(false);
  };

  // ✅ Microsoft OAuth
  const handleMicrosoftLogin = async () => {
    setError("");
    setLoading(true);
    try {
      try {
        await msalInstance.initialize();
      } catch (e) { console.log(e); }

      const loginResponse = await msalInstance.loginPopup({
        scopes: ["openid", "profile", "email"]
      });

      await authService.oauthCallback({
        idToken: loginResponse.idToken,
        provider: 'AZURE_AD'
      });
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrarse con Microsoft");
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Crear cuenta"} pages={["Crear cuenta"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Crea tu cuenta
              </h2>
              <p>Ingresa tus datos a continuación</p>
            </div>

            {/* Mensajes */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && (
              <p className="text-green-600 text-center mb-4">{success}</p>
            )}

            <div className="mt-5.5">
              {/* Social Login Buttons (Top) */}
              <div className="flex flex-col gap-4.5 mb-6">
                {/* Google Login Button */}
                <div className="relative w-full">
                  <div className="flex w-full justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 hover:bg-gray-2 cursor-pointer transition-colors">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7842 8.14966H10.2042V11.848H15.8277C15.5916 13.0765 14.7945 14.5543 13.4139 15.4897L13.4199 15.5025L16.4352 17.8365L16.6439 17.8573C18.5746 16.0759 19.9895 13.4356 19.9895 10.1871Z" fill="#4285F4" />
                      <path d="M10.2042 20.0003C12.9592 20.0003 15.2721 19.1114 16.9616 17.5531L13.7126 15.0152C12.7915 15.6329 11.6067 15.9877 10.2046 15.9877C7.54011 15.9877 5.24458 14.2078 4.43637 11.8081L4.41707 11.8252L1.28454 14.2464L1.27734 14.2657C2.98902 17.6593 6.38618 20.0003 10.2042 20.0003Z" fill="#34A853" />
                      <path d="M4.43603 11.8083C4.21857 11.1713 4.09559 10.5182 4.09559 9.99986C4.09559 9.49399 4.21272 8.85292 4.42433 8.21588L4.41846 8.19736L1.31481 5.79517L1.27668 5.81665C0.537573 7.28821 0.117188 8.96677 0.117188 9.99986C0.117188 11.1897 0.559223 13.2505 1.40194 14.8396L4.43603 11.8083Z" fill="#FBBC05" />
                      <path d="M10.2042 4.01185C12.1558 4.01185 13.4735 4.86591 14.2367 5.58414L17.0375 2.85406C15.2662 1.20261 12.9592 0 10.2042 0C6.38618 0 2.98902 2.34105 1.27734 5.81665L4.42466 8.21588C5.23326 5.80374 7.54011 4.01185 10.2042 4.01185Z" fill="#EB4335" />
                    </svg>
                    <span className="font-medium text-dark">Regístrate con Google</span>
                  </div>
                  <div className="absolute inset-0 opacity-0 z-10 overflow-hidden flex justify-center items-center">
                    <div className="w-full h-full scale-[1.5] origin-center opacity-0 cursor-pointer">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        width="500"
                        theme="outline"
                        size="large"
                        text="signup_with"
                        shape="rectangular"
                      />
                    </div>
                  </div>
                </div>

                {/* Microsoft Login Button */}
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 hover:bg-gray-2 disabled:opacity-60"
                  disabled={loading}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="11" height="11" fill="#F04E23" />
                    <rect x="13" y="0" width="11" height="11" fill="#7DB700" />
                    <rect x="0" y="13" width="11" height="11" fill="#00A4EF" />
                    <rect x="13" y="13" width="11" height="11" fill="#FFB900" />
                  </svg>
                  Regístrate con Microsoft
                </button>
              </div>

              <span className="relative z-1 block font-medium text-center mb-6">
                <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                <span className="inline-block px-3 bg-white">O usa tu email</span>
              </span>

              <form onSubmit={handleSubmit}>
                {/* Nombre */}
                <div className="mb-5">
                  <label htmlFor="firstName" className="block mb-2.5">
                    Nombre <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                {/* Apellido */}
                <div className="mb-5">
                  <label htmlFor="lastName" className="block mb-2.5">
                    Apellido <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Ingresa tu apellido"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                {/* Email */}
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Correo electrónico <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu correo electrónico"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                    autoComplete="email"
                  />
                </div>

                {/* Contraseña */}
                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Contraseña <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                    autoComplete="new-password"
                  />
                </div>

                {/* Repetir contraseña */}
                <div className="mb-5">
                  <label htmlFor="confirmPassword" className="block mb-2.5">
                    Repite la contraseña <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Vuelve a escribir tu contraseña"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                    autoComplete="new-password"
                  />
                </div>

                {/* Botón enviar */}
                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>

                {/* ¿Ya tienes cuenta? */}
                <p className="text-center mt-6">
                  ¿Ya tienes una cuenta?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Inicia sesión ahora
                  </Link>
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
