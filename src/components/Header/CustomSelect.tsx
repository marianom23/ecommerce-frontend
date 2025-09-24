"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = { label: string; value: string | number };

type Props = {
  options: SelectOption[];
  value?: string | number;                       // controlado (opcional)
  onChange?: (v: string | number, o: SelectOption) => void;
  placeholder?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;        // para aria-* y className extra

const CustomSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccioná…",
  className = "",
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [innerValue, setInnerValue] = useState<string | number | undefined>(
    value ?? options?.[0]?.value
  );

  // si viene controlado, usá value; si no, usá innerValue
  const currentValue = value !== undefined ? value : innerValue;

  const currentOption = useMemo(
    () => options.find(o => o.value === currentValue),
    [options, currentValue]
  );

  const toggle = () => setIsOpen(v => !v);
  const close  = () => setIsOpen(false);

  const handleSelect = (opt: SelectOption) => {
    if (value === undefined) setInnerValue(opt.value); // no controlado
    onChange?.(opt.value, opt);
    close();
  };

  // cerrar clic afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) close();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div
      ref={ref}
      className={`dropdown-content custom-select relative ${className}`}
      style={{ width: 200 }}
      {...rest} // aria-label, etc.
    >
      <div
        className={`select-selected whitespace-nowrap ${isOpen ? "select-arrow-active" : ""}`}
        onClick={toggle}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0} // para que sea focusable con teclado
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle();
        }}
      >
        {currentOption?.label ?? placeholder}
      </div>


      {isOpen && (
        <div className="select-items" role="listbox">
          {options.map((opt) => (
            <div
              key={String(opt.value)}
              role="option"
              aria-selected={opt.value === currentValue}
              onClick={() => handleSelect(opt)}
              className={`select-item ${opt.value === currentValue ? "same-as-selected" : ""}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
