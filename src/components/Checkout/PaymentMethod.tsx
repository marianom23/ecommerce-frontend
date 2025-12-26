"use client";
import React, { useState } from "react";
import Image from "next/image";
import { orderService, type PaymentMethod as PM } from "@/services/orderService";
import toast from "react-hot-toast";

type Props = {
  orderId?: number | null;
  onApplied?: (method: PM) => void; // opcional para avisar al padre
};

const PaymentMethod: React.FC<Props> = ({ orderId, onApplied }) => {
  const [payment, setPayment] = useState<PM | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // usamos toast para feedback en vez de banners persistentes

  // mapeo UI -> enum backend
  const mapUiToEnum = (key: "bank" /* | "cash" */ | "paypal"): PM => {
    switch (key) {
      case "bank":
        return "BANK_TRANSFER";
      // case "cash":
      //   return "CASH"; // ❌ no lo usamos
      case "paypal":
        return "CARD"; // placeholder visual
    }
  };

  async function selectPayment(key: "bank" /* | "cash" */ | "paypal") {
    const method = mapUiToEnum(key);
    setErr(null);

    setPayment(method);
    if (!orderId) return;

    setSaving(true);
    try {
      await orderService.patchPaymentMethod(orderId, { paymentMethod: method });
      toast.success("Método de pago aplicado a la orden ✓");
      onApplied?.(method);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo aplicar el método de pago."
      );
    } finally {
      setSaving(false);
    }
  }

  const opt = (key: "bank" /* | "cash" */ | "paypal") => {
    const isActive = payment === mapUiToEnum(key);
    return (
      <label
        htmlFor={key}
        className="flex cursor-pointer select-none items-center gap-4"
      >
        <div className="relative">
          <input
            type="radio"
            name="payment"
            id={key}
            className="sr-only"
            onChange={() => selectPayment(key)}
          />
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full ${isActive ? "border-4 border-blue" : "border border-gray-4"
              }`}
          />
        </div>

        <div
          className={`w-full rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${isActive ? "border-transparent bg-gray-2" : " border-gray-4 shadow-1"
            }`}
        >
          <div className="flex items-center">
            <div className="pr-2.5">
              {key === "bank" && (
                <Image
                  src="/images/checkout/bank.svg"
                  alt="bank"
                  width={29}
                  height={12}
                />
              )}
              {/* 
              {key === "cash" && (
                <Image
                  src="/images/checkout/cash.svg"
                  alt="cash"
                  width={21}
                  height={21}
                />
              )} 
              */}
              {key === "paypal" && (
                <Image
                  src="/images/payment/mercado-pago.svg"
                  alt="mercado-pago"
                  width={75}
                  height={20}
                />
              )}
            </div>
            <div className="border-l border-gray-4 pl-2.5">
              <p>
                {key === "bank" && "Transferencia bancaria"}
                {/* {key === "cash" && "Pago contra entrega"} */}
                {key === "paypal" && "Pago con tarjeta"}
              </p>
            </div>
          </div>
        </div>
      </label>
    );
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Método de pago</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-3 text-sm">
            {err}
          </div>
        )}
        {/* feedback via toast */}
        {saving && <p className="text-sm text-dark-5 mb-2">Guardando...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opt("bank")}
          {/* {opt("cash")} */}
          {opt("paypal")}
        </div>

        {/* Info banner del descuento */}
        <div className="mt-4 flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              ¡Ahorrá un 10% con transferencia bancaria!
            </p>
            <p className="text-xs text-green-700 mt-1">
              El descuento se aplicará automáticamente al seleccionar este método de pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
