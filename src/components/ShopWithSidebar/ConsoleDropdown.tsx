// components/ShopWithSidebar/ConsoleDropdown.tsx
"use client";
import { useState } from "react";
import type { CategoryFacet } from "@/types/facets";

type Props = {
  consoles: CategoryFacet[];
  selectedId?: number;
  onChange: (id?: number) => void;
};

const ConsoleItem = ({ facet, selected, onClick }: { facet: CategoryFacet; selected: boolean; onClick: () => void }) => {
  return (
    <button
      className={`${selected ? "text-blue" : ""} group flex items-center justify-between ease-out duration-200 hover:text-blue`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-2">
        <div className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${selected ? "border-blue bg-blue" : "bg-white border-gray-3"}`}>
          <svg
            className={selected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span>{facet.name}</span>
      </div>

      <span className={`${selected ? "text-white bg-blue" : "bg-gray-2"} inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue`}>
        {facet.count}
      </span>
    </button>
  );
};

const ConsoleDropdown: React.FC<Props> = ({ consoles, selectedId, onChange }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  if (consoles.length === 0) return null;

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={(e) => { e.preventDefault(); setToggleDropdown(!toggleDropdown); }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"}`}
      >
        <p className="text-dark">Consola</p>
        <button aria-label="button for console dropdown" className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"}`} type="button">
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.16101 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        <button
          type="button"
          className={`${!selectedId ? "text-blue" : ""} group flex items-center justify-between ease-out duration-200 hover:text-blue`}
          onClick={() => onChange(undefined)}
        >
          <span>Todas</span>
          <span className="bg-gray-2 inline-flex rounded-[30px] text-custom-xs px-2">—</span>
        </button>

        {consoles.map((facet) => (
          <ConsoleItem
            key={facet.id ?? facet.name}
            facet={facet}
            selected={selectedId === facet.id}
            onClick={() => onChange(selectedId === facet.id ? undefined : facet.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ConsoleDropdown;
