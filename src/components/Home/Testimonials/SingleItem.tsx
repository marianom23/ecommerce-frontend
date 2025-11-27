import React from "react";
import { ReviewResponse } from "@/types/review";
import Image from "next/image";

const SingleItem = ({ review }: { review: ReviewResponse }) => {
  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="relative w-[15px] h-[15px]">
              <Image
                src="/images/icons/icon-star.svg"
                alt="star icon"
                fill
                className={`${star <= review.rating ? "" : "grayscale opacity-40"}`}
              />
            </div>
          ))}
        </div>

        <p className="text-dark mb-6 line-clamp-4">
          {review.comment || "Sin comentario"}
        </p>
      </div>

      <div className="flex items-center gap-4 mt-auto">
        <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 shrink-0">
          {review.userName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 className="font-medium text-dark">{review.userName}</h3>
          <p className="text-custom-sm text-gray-500 line-clamp-1">
            Sobre {review.productName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
