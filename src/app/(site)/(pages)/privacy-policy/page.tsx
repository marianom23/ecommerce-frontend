import React from "react";

const PrivacyPolicyPage = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                <h1 className="text-3xl font-bold text-dark mb-8">Política de Privacidad</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm space-y-6 text-body-color">
                    <p>
                        En HorneroTech, valoramos y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal cuando visita nuestro sitio web o realiza una compra.
                    </p>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">1. Información que recopilamos</h3>
                        <p>
                            Recopilamos información que usted nos proporciona directamente, como su nombre, dirección de correo electrónico, dirección de envío y detalles de pago cuando se registra o realiza una compra.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">2. Uso de la información</h3>
                        <p>
                            Utilizamos su información para procesar sus pedidos, proporcionarle asistencia al cliente, y enviarle actualizaciones sobre sus compras. También podemos usar su información para mejorar nuestro sitio web y servicios.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">3. Protección de datos</h3>
                        <p>
                            Implementamos medidas de seguridad para proteger su información personal contra el acceso no autorizado, la alteración, divulgación o destrucción.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">4. Cookies</h3>
                        <p>
                            Utilizamos cookies para mejorar su experiencia de navegación y analizar el tráfico del sitio. Puede configurar su navegador para rechazar las cookies, pero esto puede afectar la funcionalidad del sitio.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-dark mb-3">5. Contacto</h3>
                        <p>
                            Si tiene preguntas sobre nuestra política de privacidad, contáctenos en hornerotech@gmail.com.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivacyPolicyPage;
