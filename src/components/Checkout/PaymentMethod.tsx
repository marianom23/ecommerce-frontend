"use client";

import React, { useEffect, useRef, useState } from "react";
import { Building2, CheckCircle, Wallet } from "lucide-react";
import {
  orderService,
  type OrderResponse,
  type PaymentMethod as PM,
} from "@/services/orderService";
import toast from "react-hot-toast";

type Props = {
  order?: OrderResponse | null;
  onApplied?: (method: PM) => void;
};

type PaymentOption = {
  key: "mercado_pago" | "bank";
  method: PM;
  title: string;
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  logoSrc?: string;
};

const paymentOptions: PaymentOption[] = [
  {
    key: "mercado_pago",
    method: "MERCADO_PAGO",
    title: "Mercado Pago",
    description: "Billetera virtual - La opcion mas popular en Argentina",
    icon: Wallet,
    logoSrc: "/images/logo/MP_RGB_HANDSHAKE_color_horizontal.svg",
  },
  {
    key: "bank",
    method: "BANK_TRANSFER",
    title: "Transferencia bancaria",
    description: "CBU / Alias - Bancos de Argentina",
    badge: "10% DESC",
    icon: Building2,
    logoSrc: "/images/icons/technology_13134419.png",
  },
];

const PaymentMethod: React.FC<Props> = ({ order, onApplied }) => {
  const defaultOption = paymentOptions[0];
  const hasAutoApplied = useRef(false);
  const [payment, setPayment] = useState<PM | null>(
    (order?.chosenPaymentMethod as PM | null) || defaultOption.method
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function selectPayment(option: PaymentOption, silent = false) {
    setErr(null);
    setPayment(option.method);

    if (!order?.orderNumber) {
      onApplied?.(option.method);
      return;
    }

    setSaving(true);
    try {
      await orderService.patchPaymentMethod(order.orderNumber, {
        paymentMethod: option.method,
      });

      if (!silent) {
        toast.success("Metodo de pago aplicado a la orden");
      }

      onApplied?.(option.method);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo aplicar el metodo de pago."
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (order?.chosenPaymentMethod) {
      const chosenPaymentMethod = order.chosenPaymentMethod as PM;
      setPayment(chosenPaymentMethod);
      onApplied?.(chosenPaymentMethod);
      return;
    }

    if (!hasAutoApplied.current) {
      hasAutoApplied.current = true;
      selectPayment(defaultOption, true);
    }
  }, [order?.orderNumber, order?.chosenPaymentMethod]);

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-xl text-dark">Metodo de pago</h3>
          <div className="flex items-center gap-2">
            <img
              src="/images/logo/MP_RGB_HANDSHAKE_color_horizontal.svg"
              alt="Mercado Pago"
              className="h-8 w-auto"
            />
            <span className="text-sm font-medium text-dark-4">Pago seguro</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8.5">
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
            {err}
          </div>
        )}
        {saving && <p className="text-sm text-dark-5 mb-3">Guardando...</p>}

        <div className="grid grid-cols-1 gap-3">
          {paymentOptions.map((option) => {
            const isActive = payment === option.method;
            const Icon = option.icon;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => selectPayment(option)}
                className={`w-full rounded-lg border px-4 py-4 text-left transition-colors ${
                  isActive
                    ? "border-blue bg-blue-light-5"
                    : "border-gray-3 bg-white hover:border-blue"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      option.logoSrc
                        ? "bg-white ring-1 ring-gray-3 overflow-hidden"
                        : isActive
                          ? "bg-blue text-white"
                          : "bg-gray-2 text-dark"
                    }`}
                  >
                    {option.logoSrc ? (
                      <img
                        src={option.logoSrc}
                        alt={option.title}
                        className={`object-contain ${option.key === 'bank' ? 'w-8 h-8' : 'max-h-7 max-w-10'}`}
                      />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-dark">{option.title}</p>
                      {option.badge && (
                        <span className="rounded-full bg-green px-2.5 py-0.5 text-xs font-semibold text-white">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-dark-4">
                      {option.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isActive ? "border-blue bg-blue" : "border-gray-3"
                    }`}
                  >
                    {isActive && <CheckCircle className="h-4 w-4 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
