// app/(site)/(pages)/wishlist/Wishlist.tsx
"use client";
import React, { useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearWishlist, loadWishlist } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";

export const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((s) => s.wishlistReducer.items);

  useEffect(() => {
    dispatch(loadWishlist());
  }, [dispatch]);

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button className="text-blue" onClick={() => dispatch(clearWishlist())}>
              Clear Wishlist
            </button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[500px]">
                    <p className="text-dark">Product</p>
                  </div>

                  <div className="min-w-[170px]">
                    <p className="text-dark">Unit Price</p>
                  </div>

                  {/* <div className="min-w-[265px]">
                    <p className="text-dark">Stock Status</p>
                  </div> */}

                  <div className="min-w-[237px]">
                    <p className="text-dark text-right">Action</p>
                  </div>                
                </div>

                {wishlistItems.map((item) => (
                  <SingleItem item={item} key={item.id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
