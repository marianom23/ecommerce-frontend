"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const OrderSummary = () => {
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);

  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-5 border-b border-gray-3"
            >
              <div className="pr-4">
                <p className="text-dark">
                  {item.name} <span className="text-gray-600">× {item.quantity}</span>
                </p>
              </div>
              <div>
                <p className="text-dark text-right">
                  {formatter.format(item.subtotal)}
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                {formatter.format(totalPrice)}
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full mt-7.5 inline-flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
