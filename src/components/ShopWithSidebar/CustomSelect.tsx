// ../ShopWithSidebar/CustomSelect.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = { label: string; value: string };

type CustomSelectProps = {
  options: SelectOption[];
  /** modo controlado */
  value?: string;
  /** modo no controlado (valor inicial) */
  defaultValue?: string;
  onChange?: (value: string, option: SelectOption) => void;
  className?: string;
  disabled?: boolean;
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  className,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // estado interno solo si NO es controlado
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? options?.[0]?.value ?? ""
  );
  const selectRef = useRef<HTMLDivElement | null>(null);

  const selectedValue = value ?? internalValue;

  const selectedOption = useMemo(
    () => options.find((o) => o.value === selectedValue) ?? options[0],
    [options, selectedValue]
  );

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((o) => !o);
  };

  const handleOptionClick = (option: SelectOption) => {
    if (disabled) return;
    // si es no controlado, actualiza interno
    if (value === undefined) setInternalValue(option.value);
    onChange?.(option.value, option);
    setIsOpen(false);
  };

  // cierra al clickear fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      ref={selectRef}
      className={`custom-select custom-select-2 flex-shrink-0 relative ${className ?? ""}`}
      aria-haspopup="listbox"
    >
      <button
        type="button"
        className={`select-selected whitespace-nowrap ${isOpen ? "select-arrow-active" : ""}`}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        disabled={disabled}
      >
        {selectedOption?.label ?? "Seleccionar"}
      </button>

      {/* lista */}
      <div className={`select-items ${isOpen ? "" : "select-hide"}`} role="listbox">
        {options.map((option) => (
          <div
            key={option.value}
            role="option"
            aria-selected={option.value === selectedValue}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              option.value === selectedValue ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
