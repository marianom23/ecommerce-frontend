import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Envío gratis",
    description: "Para todos los pedidos",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Devoluciones 1 a 1",
    description: "Cancelación al momento",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "Pagos 100% seguros",
    description: "Garantía de pagos",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "Soporte 24/7",
    description: "En cualquier momento",
  },
];


const HeroFeature = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-7.5 xl:gap-12.5 mt-10">
        {featureData.map((item, key) => (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left" key={key}>
            <Image src={item.img} alt="icons" width={40} height={41} />

            <div>
              <h3 className="font-medium text-lg text-dark">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
