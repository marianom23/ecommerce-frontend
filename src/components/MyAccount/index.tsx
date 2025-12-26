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
          <div className="flex flex-col gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="w-full bg-white rounded-xl shadow-1 p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold text-xl">
                    {user?.firstName ? user.firstName[0] : (user?.name?.[0] || "U")}
                  </div>
                  <div>
                    <p className="font-medium text-dark text-lg">
                      {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.name || user?.email || "Usuario"}
                    </p>
                    <p className="text-sm text-body">Miembro desde {new Date().getFullYear()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                  <TabLink href="/mi-cuenta" active={current === "dashboard"}>
                    Panel
                  </TabLink>

                  <TabLink href="/mi-cuenta/orders" active={current === "orders"}>
                    Pedidos
                  </TabLink>

                  <TabLink href="/mi-cuenta/downloads" active={current === "downloads"}>
                    Descargas
                  </TabLink>

                  <TabLink href="/mi-cuenta/addresses" active={current === "addresses"}>
                    Direcciones
                  </TabLink>

                  <TabLink href="/mi-cuenta/account-details" active={current === "account-details"}>
                    Cuenta
                  </TabLink>

                  <button
                    onClick={handleLogout}
                    className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-red hover:text-white text-red bg-red/5"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>

            {/* <!--== user dashboard menu end ==-->
              
            <!--== user dashboard content start ==--> */}
            {/* <!-- dashboard tab content start --> */}

            <div className={`w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${current === "dashboard" ? "block" : "hidden"}`}>
              <p className="text-dark">
                Hola {user?.firstName ? user.firstName : user?.name || "Usuario"} (¿no eres {user?.firstName ? user.firstName : user?.name || "Usuario"}?
                <button
                  onClick={handleLogout}
                  className="text-red ease-out duration-200 hover:underline ml-1"
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
            <div className={`w-full bg-white rounded-xl shadow-1 ${current === "orders" ? "block" : "hidden"}`}>
              <Orders />
            </div>
            {/* <!-- orders tab content end -->

            <!-- downloads tab content start --> */}
            <div className={`w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${current === "downloads" ? "block" : "hidden"}`}>
              <p>No tienes ninguna descarga</p>
            </div>
            {/* <!-- downloads tab content end -->

            <!-- addresses tab content start --> */}
            <div className={`w-full ${current === "addresses" ? "block" : "hidden"}`}>
              <ManageAddresses />
            </div>
            {/* <!-- addresses tab content end -->

            <!-- details tab content start --> */}
            <div className={`w-full ${current === "account-details" ? "block" : "hidden"}`}>
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
