"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { registerService } from "@/services/RegisterService";

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
      setError(err?.message || "No se pudo completar el registro.");
    } finally {
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
