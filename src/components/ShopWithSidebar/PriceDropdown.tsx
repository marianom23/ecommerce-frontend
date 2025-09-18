"use client";
import { useEffect, useMemo, useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

type Props = {
  minLimit: number;          // límites desde facets.priceRange.minPrice
  maxLimit: number;          // límites desde facets.priceRange.maxPrice
  valueFrom: number;         // valor actual seleccionado (o límite si no hay URL)
  valueTo: number;           // valor actual seleccionado (o límite si no hay URL)
  onChange: (from: number, to: number) => void; // aplicar selección
  onClear?: () => void;      // limpiar filtro
};

const PriceDropdown: React.FC<Props> = ({
  minLimit,
  maxLimit,
  valueFrom,
  valueTo,
  onChange,
  onClear,
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  // Estado local para drag suave sin parpadeos
  const [localFrom, setLocalFrom] = useState<number>(valueFrom);
  const [localTo, setLocalTo] = useState<number>(valueTo);

  // Cuando cambian límites o valor externo (URL), sincronizamos el local
  useEffect(() => {
    setLocalFrom(valueFrom);
  }, [valueFrom]);
  useEffect(() => {
    setLocalTo(valueTo);
  }, [valueTo]);

  // Evitamos valores fuera de rango si el backend cambia los límites
  const clamped = useMemo<[number, number]>(() => {
    const from = Math.max(minLimit, Math.min(localFrom, maxLimit));
    const to = Math.max(minLimit, Math.min(localTo, maxLimit));
    return from <= to ? [from, to] : [to, from];
  }, [localFrom, localTo, minLimit, maxLimit]);

  const hasCustom =
    (valueFrom !== minLimit && minLimit !== 0) ||
    (valueTo !== maxLimit && maxLimit !== 0);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark">Precio</p>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          id="price-dropdown-btn"
          aria-label="button for price dropdown"
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"}`}
          type="button"
        >
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
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* dropdown menu */}
      <div className={`p-6 ${toggleDropdown ? "block" : "hidden"}`}>
        <div className="price-range">
          <RangeSlider
            id="range-slider-gradient"
            className="margin-lg"
            min={minLimit}
            max={maxLimit}
            step={1}
            value={clamped}
            onInput={([from, to]) => {
              setLocalFrom(Math.floor(from));
              setLocalTo(Math.ceil(to));
            }}
            onThumbDragEnd={() => {
              // aplicamos al soltar
              onChange(clamped[0], clamped[1]);
            }}
          />

          <div className="price-amount flex items-center justify-between pt-4">
            <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80">
              <span className="block border-r border-gray-3/80 px-2.5 py-1.5">$</span>
              <span id="minAmount" className="block px-3 py-1.5">{clamped[0]}</span>
            </div>

            <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80">
              <span className="block border-r border-gray-3/80 px-2.5 py-1.5">$</span>
              <span id="maxAmount" className="block px-3 py-1.5">{clamped[1]}</span>
            </div>
          </div>

          {/* <div className="flex gap-2 pt-4">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              onClick={() => onChange(clamped[0], clamped[1])}
            >
              Aplicar
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              disabled={!hasCustom}
              onClick={() => {
                setLocalFrom(minLimit);
                setLocalTo(maxLimit);
                onClear?.();
              }}
            >
              Limpiar
            </button>
          </div> */}

          {/* hint del rango total */}
          {/* <p className="mt-3 text-xs text-gray-500">
            Rango del catálogo: ${minLimit} – ${maxLimit}
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
