// utils/orders.ts
export const statusToBadge = (s?: string) => {
  const k = (s ?? "").toLowerCase();
  if (k === "delivered")  return "text-green bg-green-light-6";
  if (k === "on_hold")    return "text-red bg-red-light-6";
  if (k === "processing") return "text-yellow bg-yellow-light-4";
  if (k === "cancelled")  return "text-red bg-red-light-6";
  if (k === "pending")    return "text-dark bg-gray-2";
  return "text-dark bg-gray-2";
};

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "";

export const fmtMoney = (n: number | string | undefined) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
};
