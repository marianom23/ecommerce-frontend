import Faq from "@/components/Faq";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | HorneroTech",
  description: "Preguntas frecuentes sobre compras, pagos, entregas digitales y envíos en HorneroTech.",
};

const FaqPage = () => {
  return (
    <main>
      <Faq />
    </main>
  );
};

export default FaqPage;
