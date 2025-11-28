"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import ManageAddresses from "./ManageAddresses";

type MyAccountProps = {
  current:
    | "dashboard"
    | "orders"
    | "downloads"
    | "addresses"
    | "account-details"
    | "logout"
    | string;
};

const TabLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
      active ? "text-white bg-blue" : "text-dark-2 bg-gray-1"
    }`}
  >
    {children}
  </Link>
);

export default function MyAccount({ current }: MyAccountProps) {
    const { user } = useAuth();

    return (
      <>
        <Breadcrumb title={"Mi Cuenta"} pages={["mi cuenta"]} />

        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-col xl:flex-row gap-7.5">
              {/* <!--== user dashboard menu start ==--> */}
              <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
                <div className="flex xl:flex-col">
                  <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                    <div>
                      <p className="font-medium text-dark mb-0.5">
                        {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.name || user?.email || "Usuario"}
                      </p>
                      <p className="text-custom-xs">Miembro desde {new Date().getFullYear()}</p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-7.5 xl:p-9">
                    <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                      <TabLink href="/mi-cuenta" active={current === "dashboard"}>
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                        Panel
                      </TabLink>

                      <TabLink href="/mi-cuenta/orders" active={current === "orders"}>
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                        Pedidos
                      </TabLink>

                      <TabLink href="/mi-cuenta/downloads" active={current === "downloads"}>
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                        Descargas
                      </TabLink>

                      <TabLink href="/mi-cuenta/addresses" active={current === "addresses"}>
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                        Direcciones
                      </TabLink>

                      <TabLink href="/mi-cuenta/account-details" active={current === "account-details"}>
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                        Detalles de Cuenta
                      </TabLink>

                      <TabLink href="/mi-cuenta/logout" active={current === "logout"}>
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                        Cerrar Sesión
                      </TabLink>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* <!--== user dashboard menu end ==-->

              
            <!--== user dashboard content start ==--> */}
              {/* <!-- dashboard tab content start --> */}

              <div className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${current === "dashboard" ? "block" : "hidden"}`}>
                <p className="text-dark">
                  Hola {user?.firstName ? user.firstName : user?.name || "Usuario"} (¿no eres {user?.firstName ? user.firstName : user?.name || "Usuario"}?
                  <a
                    href="#"
                    className="text-red ease-out duration-200 hover:underline"
                  >
                    Cerrar Sesión
                  </a>
                  )
                </p>

                <p className="text-custom-sm mt-4">
                  Desde tu panel de cuenta puedes ver tus pedidos recientes,
                  gestionar tus direcciones de envío y facturación, y editar tu
                  contraseña y detalles de cuenta.
                </p>
              </div>
              {/* <!-- dashboard tab content end -->

            <!-- orders tab content start --> */}
              {/* Orders */}
              <div className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${current === "orders" ? "block" : "hidden"}`}>
                <Orders />
              </div>
              {/* <!-- orders tab content end -->

            <!-- downloads tab content start --> */}
              <div className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${current === "downloads" ? "block" : "hidden"}`}>
                <p>No tienes ninguna descarga</p>
              </div>
              {/* <!-- downloads tab content end -->

            <!-- addresses tab content start --> */}
   <div className={`xl:max-w-[770px] w-full ${current === "addresses" ? "block" : "hidden"}`}>
     <ManageAddresses />
   </div>
              {/* <!-- addresses tab content end -->

            <!-- details tab content start --> */}
              <div className={`xl:max-w-[770px] w-full ${current === "account-details" ? "block" : "hidden"}`}>
                <form>
                  <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                      <div className="w-full">
                        <label htmlFor="firstName" className="block mb-2.5">
                          Nombre <span className="text-red">*</span>
                        </label>

                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          placeholder="Jhon"
                          value="Jhon"
                          className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        />
                      </div>

                      <div className="w-full">
                        <label htmlFor="lastName" className="block mb-2.5">
                          Apellido <span className="text-red">*</span>
                        </label>

                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          placeholder="Deo"
                          value="Deo"
                          className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="countryName" className="block mb-2.5">
                        País/ Región <span className="text-red">*</span>
                      </label>

                      <div className="relative">
                        <select className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20">
                          <option value="0">Australia</option>
                          <option value="1">America</option>
                          <option value="2">England</option>
                        </select>

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4">
                          <svg
                            className="fill-current"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.41469 5.03569L2.41467 5.03571L2.41749 5.03846L7.76749 10.2635L8.0015 10.492L8.23442 10.2623L13.5844 4.98735L13.5844 4.98735L13.5861 4.98569C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345C13.9152 5.31373 13.915 5.31401 13.9147 5.31429L8.16676 10.9622L8.16676 10.9622L8.16469 10.9643C8.06838 11.0606 8.02352 11.0667 8.00039 11.0667C7.94147 11.0667 7.89042 11.0522 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z"
                              fill=""
                              stroke=""
                              stroke-width="0.666667"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Guardar Cambios
                    </button>
                  </div>

                  <p className="text-custom-sm mt-5 mb-9">
                    Así es como se mostrará tu nombre en la sección de cuenta
                    y en las reseñas
                  </p>

                  <p className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Cambio de Contraseña
                  </p>

                  <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <div className="mb-5">
                      <label htmlFor="oldPassword" className="block mb-2.5">
                        Contraseña Actual
                      </label>

                      <input
                        type="password"
                        name="oldPassword"
                        id="oldPassword"
                        autoComplete="on"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <div className="mb-5">
                      <label htmlFor="newPassword" className="block mb-2.5">
                        Nueva Contraseña
                      </label>

                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        autoComplete="on"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <div className="mb-5">
                      <label
                        htmlFor="confirmNewPassword"
                        className="block mb-2.5"
                      >
                        Confirmar Nueva Contraseña
                      </label>

                      <input
                        type="password"
                        name="confirmNewPassword"
                        id="confirmNewPassword"
                        autoComplete="on"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Cambiar Contraseña
                    </button>
                  </div>
                </form>
              </div>
              {/* <!-- details tab content end -->
            <!--== user dashboard content end ==--> */}
            </div>
          </div>
        </section> 
      </>
  );
};
