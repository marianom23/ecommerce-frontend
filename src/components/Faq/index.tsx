import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Globe,
  Mail,
  MessageSquare,
  Package,
  RefreshCw,
  Shield,
  ShieldCheck,
  Truck,
} from "lucide-react";

const faqGroups = [
  {
    title: "Juegos digitales",
    items: [
      {
        icon: CheckCircle,
        question: "¿Es original?",
        answer: "Sí, código oficial garantizado.",
      },
      {
        icon: Clock,
        question: "¿Cuándo lo recibo?",
        answer: "Inmediato, llega a tu email automáticamente.",
      },
      {
        icon: Shield,
        question: "¿Es seguro?",
        answer: "Pagos protegidos por Mercado Pago.",
      },
      {
        icon: Globe,
        question: "¿Es compatible con Argentina?",
        answer: "Sí, funciona 100% en Argentina con todos los métodos de pago locales.",
      },
      {
        icon: MessageSquare,
        question: "¿Las claves están en español?",
        answer: "Sí, todo está en español: interfaz, instrucciones y soporte.",
      },
      {
        icon: ShieldCheck,
        question: "¿Hay riesgo de baneo?",
        answer: "No. Son claves oficiales sin bloqueo regional para Argentina y no pueden bloquear tu cuenta por canjearlas.",
      },
    ],
  },
  {
    title: "Productos físicos",
    items: [
      {
        icon: Truck,
        question: "¿Cuánto tarda el envío?",
        answer: "Estándar 5-7 días hábiles aprox.",
      },
      {
        icon: Package,
        question: "¿Es producto sellado?",
        answer: "Sí, sellado de fábrica y 100% original.",
      },
      {
        icon: RefreshCw,
        question: "¿Puedo devolverlo?",
        answer: "Sí, 30 días para cambios o devolución. Cubrimos desperfectos técnicos.",
      },
      {
        icon: Globe,
        question: "¿Envían a todo Argentina?",
        answer: "Sí, envíos a todas las provincias.",
      },
      {
        icon: MessageSquare,
        question: "¿Cómo hago seguimiento?",
        answer: "Te enviamos código de tracking por email.",
      },
    ],
  },
  {
    title: "Pedidos combinados",
    items: [
      {
        icon: Truck,
        question: "¿Por qué me pide dirección si también compro digital?",
        answer: "Porque tu pedido incluye al menos un producto físico. Lo digital se entrega después del pago y lo físico se envía a tu dirección.",
      },
      {
        icon: Mail,
        question: "¿Cuándo recibo lo digital?",
        answer: "Después de aprobarse el pago, por email o desde tu cuenta.",
      },
      {
        icon: Package,
        question: "¿Cómo recibo lo físico?",
        answer: "Lo enviamos a la dirección que cargues, con seguimiento por email.",
      },
      {
        icon: CreditCard,
        question: "¿Tengo que hacer dos compras?",
        answer: "No. Pagás una sola vez y cada producto se entrega según su formato.",
      },
      {
        icon: Shield,
        question: "¿El pago es seguro?",
        answer: "Sí. Los pagos están protegidos por Mercado Pago.",
      },
    ],
  },
];

const Faq = () => {
  return (
    <>
      <Breadcrumb title={"Preguntas frecuentes"} pages={["preguntas frecuentes"]} />
      <section className="overflow-hidden bg-gray-2 py-10 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mx-auto mb-10 max-w-[760px] text-center">
            <h1 className="mb-4 text-3xl font-semibold text-dark lg:text-4xl">
              Preguntas frecuentes
            </h1>
            <p className="text-base leading-7 text-dark-4 sm:text-lg">
              Respuestas rápidas sobre entrega digital, envíos físicos, pagos y pedidos combinados.
            </p>
          </div>

          <div className="space-y-10">
            {faqGroups.map((group) => (
              <section key={group.title}>
                <h2 className="mb-5 text-xl font-semibold text-dark sm:text-2xl">
                  {group.title}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map(({ icon: Icon, question, answer }) => (
                    <article
                      key={question}
                      className="rounded-lg border border-gray-3 bg-white p-5 shadow-1"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-light-5 text-blue">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-2 text-base font-semibold leading-6 text-dark">
                        {question}
                      </h3>
                      <p className="text-sm leading-6 text-dark-4">{answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Faq;
