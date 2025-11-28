"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import ManageAddresses from "./ManageAddresses";
import AccountDetails from "./AccountDetails";

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
    className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${active ? "text-white bg-blue" : "text-dark-2 bg-gray-1"
      }`}
  >
    {children}
  </Link>
);

export default function MyAccount({ current }: MyAccountProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await authService.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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

                    <button
                      onClick={handleLogout}
                      className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white text-dark-2 bg-gray-1 w-full text-left"
                    >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden />
                      Cerrar Sesión
                    </button>
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
                <button
                  onClick={handleLogout}
                  className="text-red ease-out duration-200 hover:underline"
                >
                  Cerrar Sesión
                </button>
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
              <AccountDetails />
            </div>
            {/* <!-- details tab content end -->
            <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>
    </>
  );
};
