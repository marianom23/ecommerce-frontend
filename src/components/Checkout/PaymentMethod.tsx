"use client";
import React, { useState } from "react";
import Image from "next/image";
import { orderService, type PaymentMethod as PM } from "@/services/orderService";

type Props = {
  orderId?: number | null;
  onApplied?: (method: PM) => void; // opcional para avisar al padre
};

const PaymentMethod: React.FC<Props> = ({ orderId, onApplied }) => {
  const [payment, setPayment] = useState<PM | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

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
    setOkMsg(null);

    setPayment(method);
    if (!orderId) return;

    setSaving(true);
    try {
      await orderService.patchPaymentMethod(orderId, { paymentMethod: method });
      setOkMsg("Método de pago aplicado a la orden ✓");
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
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              isActive ? "border-4 border-blue" : "border border-gray-4"
            }`}
          />
        </div>

        <div
          className={`rounded-md border-[0.5px] py-3.5 px-5 min-w-[240px] ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${
            isActive ? "border-transparent bg-gray-2" : " border-gray-4 shadow-1"
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
                  src="/images/checkout/paypal.svg"
                  alt="paypal"
                  width={75}
                  height={20}
                />
              )}
            </div>
            <div className="border-l border-gray-4 pl-2.5">
              <p>
                {key === "bank" && "Direct bank transfer"}
                {/* {key === "cash" && "Cash on delivery"} */}
                {key === "paypal" && "Tarjeta (gateway)"}
              </p>
            </div>
          </div>
        </div>
      </label>
    );
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-3 text-sm">
            {err}
          </div>
        )}
        {okMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 mb-3 text-sm">
            {okMsg}
          </div>
        )}
        {saving && <p className="text-sm text-dark-5 mb-2">Guardando...</p>}

        <div className="flex flex-col gap-3">
          {opt("bank")}
          {/* {opt("cash")} */}
          {opt("paypal")}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
