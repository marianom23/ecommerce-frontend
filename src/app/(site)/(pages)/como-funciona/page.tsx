import ComoFunciona from "@/components/ComoFunciona";

import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Cómo Funciona | Nindo Games - Juegos Digitales Nintendo Switch",
    description: "Aprende cómo comprar y canjear juegos digitales originales de Nintendo Switch de forma segura y rápida.",
};

const ComoFuncionaPage = () => {
    return (
        <main>
            <ComoFunciona />
        </main>
    );
};

export default ComoFuncionaPage;
