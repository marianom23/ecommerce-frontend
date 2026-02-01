import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WelcomeBanner = () => {
    return (
        <section className="bg-[#E5EAF4] text-black pt-28 sm:pt-32 lg:pt-40">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-balance leading-tight tracking-tight">
                        Juegos digitales originales para Nintendo Switch
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl leading-relaxed text-balance mb-4 md:mb-6 text-black/90">
                        Vendemos juegos digitales originales en formato KEY para Nintendo Switch y Switch 2.
                        Te enviamos un código único que canjeás directamente en tu consola, sin cuentas compartidas.
                    </p>
                    <p className="text-sm md:text-base lg:text-lg leading-relaxed text-balance mb-8 md:mb-12 text-black/80">
                        Funciona en todas las regiones: no importa dónde esté registrada tu cuenta, los juegos se activan sin problema.
                        Entrega rápida, soporte personalizado y 100% confiable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                        <Link href="/productos">
                            <Button size="lg" className="bg-black text-white hover:bg-black/90 font-semibold text-sm md:text-base px-6 md:px-8 h-11 md:h-12">
                                Explorá nuestro catálogo
                            </Button>
                        </Link>
                        <Link href="/como-funciona">
                            <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-black/5 bg-transparent font-semibold text-sm md:text-base px-6 md:px-8 h-11 md:h-12">
                                Cómo Funciona
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WelcomeBanner;
