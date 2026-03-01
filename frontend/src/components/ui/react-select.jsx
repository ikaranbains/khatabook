"use client";

import Select from "react-select";

function toOption(item) {
  if (typeof item === "string") {
    return { value: item, label: item };
  }
  return item;
}

export default function AppSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isDisabled = false,
  isSearchable = false,
  menuPlacement = "auto",
  className,
}) {
  const normalizedOptions = options.map(toOption);
  const selected = normalizedOptions.find((option) => option.value === value) || null;

  return (
    <Select
      className={className}
      classNamePrefix="app-select"
      options={normalizedOptions}
      value={selected}
      onChange={(option) => onChange(option?.value || "")}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      menuPlacement={menuPlacement}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      components={{ IndicatorSeparator: () => null }}
      styles={{
        container: (base) => ({ ...base, width: "100%" }),
        control: (base, state) => ({
          ...base,
          minHeight: 44,
          borderRadius: 12,
          borderColor: state.isFocused ? "rgba(21,21,19,0.25)" : "rgba(21,21,19,0.1)",
          backgroundColor: "#ffffff",
          boxShadow: "none",
          cursor: "pointer",
          "&:hover": { borderColor: "rgba(21,21,19,0.2)" },
        }),
        valueContainer: (base) => ({ ...base, padding: "0 12px" }),
        singleValue: (base) => ({
          ...base,
          color: "#0f172a",
          fontSize: 14,
        }),
        placeholder: (base) => ({
          ...base,
          color: "#94a3b8",
          fontSize: 14,
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "rgba(21,21,19,0.45)",
          padding: 8,
        }),
        menuPortal: (base) => ({ ...base, zIndex: 60 }),
        menu: (base) => ({
          ...base,
          marginTop: 6,
          borderRadius: 12,
          border: "1px solid rgba(21,21,19,0.1)",
          boxShadow: "0 10px 30px rgba(21,21,19,0.15)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }),
        menuList: (base) => ({ ...base, padding: 4 }),
        option: (base, state) => ({
          ...base,
          borderRadius: 8,
          fontSize: 14,
          color: "#0f172a",
          backgroundColor: state.isSelected
            ? "#fff3c4"
            : state.isFocused
              ? "#f1eee6"
              : "#ffffff",
          cursor: "pointer",
          padding: "8px 10px",
        }),
      }}
    />
  );
}
