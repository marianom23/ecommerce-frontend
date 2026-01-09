import React from "react";

const RefundPolicyPage = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                <h1 className="text-3xl font-bold text-dark mb-8">Política de Reembolso</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm space-y-6 text-body-color">
                    <p>
                        En HorneroTech, nos esforzamos por garantizar la satisfacción del cliente. Si no está completamente satisfecho con su compra, estamos aquí para ayudarle.
                    </p>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">1. Devoluciones</h3>
                        <p>
                            Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El artículo debe estar sin usar, en las mismas condiciones en que lo recibió y en su embalaje original.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">2. Reembolsos</h3>
                        <p>
                            Una vez recibida e inspeccionada su devolución, le notificaremos la aprobación o rechazo de su reembolso. Si es aprobado, se procesará el reembolso a su método de pago original dentro de una cierta cantidad de días.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">3. Artículos no reembolsables</h3>
                        <p>
                            Ciertos tipos de artículos no son elegibles para devolución, como productos perecederos, software descargable y tarjetas de regalo.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">4. Envío de devoluciones</h3>
                        <p>
                            Usted será responsable de pagar sus propios costos de envío para devolver su artículo. Los costos de envío no son reembolsables.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">5. Contacto</h3>
                        <p>
                            Para iniciar una devolucion o reembolso, contáctenos en hornerotech@gmail.com.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RefundPolicyPage;
