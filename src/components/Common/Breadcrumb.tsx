import Link from "next/link";
import React from "react";

// Crumb puede ser string o un objeto { label, href }
type Crumb = string | { label: React.ReactNode; href: string };

type Props = {
  title: React.ReactNode;
  pages?: Crumb[];
};

const Breadcrumb: React.FC<Props> = ({ title, pages = [] }) => {
  return (
    <div className="overflow-hidden shadow-breadcrumb pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]">
      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2">
              {title}
            </h1>

            <ul className="flex items-center gap-2">
              {/* Home */}
              <li className="text-custom-sm hover:text-blue">
                <Link href="/">Home</Link>
              </li>

              {/* Separador */}
              {pages.length > 0 && <li className="text-custom-sm">/</li>}

              {/* Resto de migas */}
              {pages.map((page, i) => {
                // Si es string, renderizo directamente el texto
                if (typeof page === "string") {
                  return (
                    <React.Fragment key={`${page}-${i}`}>
                      <li className="text-custom-sm capitalize">{page}</li>
                      {i < pages.length - 1 && (
                        <li className="text-custom-sm">/</li>
                      )}
                    </React.Fragment>
                  );
                }

                // Si es objeto { label, href }
                return (
                  <React.Fragment key={page.href || String(i)}>
                    <li className="text-custom-sm hover:text-blue capitalize">
                      <Link href={page.href}>{page.label}</Link>
                    </li>
                    {i < pages.length - 1 && (
                      <li className="text-custom-sm">/</li>
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
