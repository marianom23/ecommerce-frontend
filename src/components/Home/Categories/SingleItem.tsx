"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

type UICategory = {
  id: number;
  title: string;
  img?: string | null;
  count?: number;
};

const SingleItem = ({ item }: { item: UICategory }) => {
  const imgSrc = item.img ?? "/images/placeholders/category.png"; // poné tu placeholder

  return (
    <Link
      href={{ pathname: "/productos", query: { categoryId: item.id } }}
      className="group flex flex-col items-center"
    >
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 overflow-hidden">
        <Image src={imgSrc} alt={item.title} width={82} height={62} />
      </div>

      <div className="flex justify-center">
        <h3
          title={item.title}
          className="inline-block font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue"
        >
          {item.title}
        </h3>
      </div>

      {/* opcional: mostrar cantidad */}
      {typeof item.count === "number" && (
        <span className="mt-1 text-xs text-gray-500">{item.count} productos</span>
      )}
    </Link>
  );
};

export default SingleItem;
