import React, { useState } from "react";
import Image from "next/image";

const ShippingMethod = () => {
  const [shippingMethod, setShippingMethod] = useState("free");
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Método de envío</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="free"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="free"
                id="free"
                className="sr-only"
                onChange={() => setShippingMethod("free")}
              />
              {/* selectShipping === 'free' ? 'border-4 border-blue' : 'border border-gray-4' */}
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "free"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            Envío gratis
          </label>
          {/* Otros métodos deshabilitados por ahora */}
          {false && (
            <>
              <label htmlFor="fedex" className="flex cursor-pointer select-none items-center gap-3.5"></label>
              <label htmlFor="dhl" className="flex cursor-pointer select-none items-center gap-3.5"></label>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
