import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

const TermsOfUsePage = () => {
    return (
        <>
            <Breadcrumb title={"Términos de Uso"} pages={["Términos de Uso"]} />
            <section className="pt-5 pb-20 bg-gray-50">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">


                    <div className="bg-white p-8 rounded-lg shadow-sm space-y-6 text-body-color">
                        <p>
                            Bienvenido a HorneroTech. Al acceder y utilizar este sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso.
                        </p>

                        <div>
                            <h3 className="text-xl font-semibold text-dark mb-3">1. Uso del Sitio</h3>
                            <p>
                                El contenido de este sitio web es para su información general y uso personal. Está sujeto a cambios sin previo aviso. El uso no autorizado de este sitio web puede dar lugar a una reclamación por daños y/o ser un delito penal.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-dark mb-3">2. Propiedad Intelectual</h3>
                            <p>
                                Este sitio web contiene material que es propiedad nuestra o tiene licencia para nosotros. Este material incluye, pero no se limita a, el diseño, la apariencia y los gráficos. Queda prohibida la reproducción salvo de conformidad con el aviso de copyright.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-dark mb-3">3. Enlaces a terceros</h3>
                            <p>
                                Este sitio web puede incluir enlaces a otros sitios web. Estos enlaces se proporcionan para su conveniencia para proporcionar más información. No significan que respaldamos el sitio web. No tenemos responsabilidad por el contenido de los sitios web vinculados.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-dark mb-3">4. Limitación de responsabilidad</h3>
                            <p>
                                En ningún caso HorneroTech será responsable por cualquier pérdida o daño, incluidos, entre otros, daños indirectos o consecuentes, o cualquier daño que surja de la pérdida de datos o ganancias que surjan del uso de este sitio web.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-dark mb-3">5. Ley aplicable</h3>
                            <p>
                                El uso de este sitio web y cualquier disputa que surja de dicho uso del sitio web está sujeto a las leyes de Argentina.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TermsOfUsePage;
