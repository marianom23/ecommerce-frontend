"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hornerotech_cookie_notice_seen";

const CookieNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "true");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[99999] rounded-lg border border-gray-200 bg-white p-4 shadow-2 sm:left-auto sm:max-w-md">
      <p className="text-sm leading-5 text-dark-4">
        Usamos cookies y herramientas de analitica para entender el uso del sitio, mejorar tu experiencia y medir el rendimiento de la tienda.
        {" "}
        <Link href="/privacy-policy" className="font-medium text-blue hover:underline">
          Politica de privacidad
        </Link>
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md bg-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default CookieNotice;
