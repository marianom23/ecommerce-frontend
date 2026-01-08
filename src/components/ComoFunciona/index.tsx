"use client";

import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";

const ComoFunciona = () => {
    return (
        <>
            <Breadcrumb title={"Cómo Funciona"} pages={["como funciona"]} />
            <section className="overflow-hidden py-20 bg-gray-2">
                <div className="max-w-[1070px] w-full mx-auto px-4 sm:px-8 xl:px-0">
                    {/* Intro */}
                    <div className="max-w-[750px] mx-auto text-center mb-12">
                        <h1 className="font-semibold text-dark text-3xl lg:text-4xl mb-6">
                            Cómo Funciona
                        </h1>
                        <p className="text-lg text-dark-2">
                            En HorneroTech ofrecemos juegos digitales originales de Nintendo Switch y Switch 2 en formato KEY (código de descarga).
                            Es una forma simple, rápida y totalmente segura de tener tus juegos sin necesidad de cuentas compartidas ni métodos complicados.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-2xl font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-dark mb-3">
                                        🛒 Hacés tu pedido
                                    </h3>
                                    <p className="text-dark-2 mb-3">
                                        Elegís el juego que querés, agregalo al carrito y realizá la compra. Si tenés alguna duda sobre el producto o los medios de pago, contactanos primero y te ayudaremos.
                                    </p>
                                    <p className="text-dark-2 font-medium">
                                        ✅ Aceptamos transferencias bancarias argentinas y Mercadopago (tarjetas de débito, crédito, dinero en cuenta, pagos en efectivo y demás).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-2xl font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-dark mb-3">
                                        💳 Confirmamos el pago
                                    </h3>
                                    <p className="text-dark-2 mb-2">
                                        Una vez que recibimos el comprobante, preparamos tu pedido.
                                    </p>
                                    <p className="text-sm text-dark-2">
                                        ⏱️ La entrega puede demorar hasta 24 horas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-2xl font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-dark mb-3">
                                        📩 Te enviamos tu clave digital
                                    </h3>
                                    <p className="text-dark-2 mb-2">
                                        Recibís una clave original (KEY) junto a un breve tutorial de cómo canjear directamente en la Nintendo eShop.
                                    </p>
                                    <p className="text-sm text-dark-2">
                                        🎯 Estas claves provienen de Japón, por lo que requieren un paso muy simple previo al canje.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-2xl font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-dark mb-3">
                                        🌏 Cambiás temporalmente la región de tu cuenta a Japón
                                    </h3>
                                    <p className="text-dark-2 mb-3">
                                        Para canjear el código, tenés que cambiar temporalmente la región de tu cuenta Nintendo a Japón.
                                        Es un proceso seguro, permitido por Nintendo y no tiene consecuencias negativas.
                                    </p>
                                    <p className="text-sm text-dark-2 mb-4">
                                        📌 Después del canje, podés volver a tu región habitual sin problemas.
                                    </p>

                                    <div className="bg-gray-2 rounded-lg p-4 mb-3">
                                        <h4 className="font-semibold text-dark mb-2">🔧 ¿Cómo se cambia la región?</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-dark-2">
                                            <li>Ingresá a tu cuenta desde <a href="https://accounts.nintendo.com" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">https://accounts.nintendo.com</a></li>
                                            <li>En el menú izquierdo, hacé clic en &quot;Perfil&quot;</li>
                                            <li>En &quot;País o región&quot;, elegí Japón</li>
                                            <li>Guardá los cambios</li>
                                        </ol>
                                    </div>

                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                        <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Importante:</p>
                                        <ul className="text-sm text-yellow-700 space-y-1">
                                            <li>• No podés cambiar la región si tenés saldo disponible en la eShop o una preventa activa.</li>
                                            <li>• Si es tu caso, podés usar otra cuenta o esperar a usar el saldo.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-2xl font-bold">
                                    5
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-dark mb-3">
                                        🕹️ Canjeás tu código
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-2 text-dark-2 mb-3">
                                        <li>En tu consola, abrí la Nintendo eShop con tu cuenta (ahora configurada en Japón)</li>
                                        <li>Seleccioná tu perfil</li>
                                        <li>Elegí &quot;Canjear código&quot;</li>
                                        <li>Ingresá el código que te enviamos</li>
                                    </ol>
                                    <p className="text-dark-2 font-medium">
                                        🎮 El juego comenzará a descargarse automáticamente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 6 */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-2xl font-bold">
                                    6
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-dark mb-3">
                                        🔁 Volvés a tu región
                                    </h3>
                                    <p className="text-dark-2 mb-2">
                                        Una vez canjeado el código, podés volver a <a href="https://accounts.nintendo.com" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">https://accounts.nintendo.com</a> y restaurar
                                        la región de tu cuenta a la que usás normalmente (por ejemplo, Argentina o EE.UU.).
                                    </p>
                                    <p className="text-dark-2 font-medium">
                                        ✅ El juego sigue funcionando perfectamente y queda vinculado a tu cuenta para siempre.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="mt-12 bg-gradient-to-br from-blue to-blue-dark rounded-xl p-8 text-white">
                        <h3 className="font-semibold text-2xl mb-4">🔐 ¿Es seguro?</h3>
                        <p className="text-lg mb-4">Sí, 100%:</p>
                        <ul className="space-y-2 mb-6">
                            <li>✓ Juegos originales</li>
                            <li>✓ Código único para vos</li>
                            <li>✓ Sin cuentas compartidas</li>
                            <li>✓ Sin trucos ni riesgos</li>
                            <li>✓ Funciona igual en Switch y Switch 2</li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="mt-8 bg-white rounded-xl p-6 sm:p-8 shadow-md">
                        <h3 className="font-semibold text-xl text-dark mb-3">
                            🤝 Soporte personalizado
                        </h3>
                        <p className="text-dark-2 mb-4">
                            ¿Dudas al cambiar la región o canjear el código? ¡Estamos para ayudarte!
                        </p>
                        <p className="text-dark-2 mb-4">
                            📱 Escribinos por WhatsApp y te guiamos paso a paso, sin bots ni respuestas automáticas.
                        </p>
                        <p className="text-sm text-dark-2">
                            <strong>Política de reembolso:</strong> Una vez recibido el código, no es posible realizar reembolsos,
                            ya que el código queda vinculado a tu compra de forma permanente.
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="mt-8 bg-green text-white rounded-xl p-6 sm:p-8">
                        <h3 className="font-semibold text-2xl mb-4">📢 Resumen</h3>
                        <p className="text-lg mb-4">
                            Comprás → Recibís tu código → Cambiás temporalmente a Japón → Canjeás → Volvés a tu región → ¡Jugás para siempre!
                        </p>
                        <ul className="space-y-2">
                            <li>• Solo necesitás una cuenta Nintendo y conexión a internet</li>
                            <li>• No hay límite de veces para cambiar de región</li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ComoFunciona;
