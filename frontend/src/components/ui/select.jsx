"use client";

import AppSelect from "@/components/ui/react-select";

function Select({ value, onValueChange, options = [], placeholder = "Select...", disabled = false }) {
  return (
    <AppSelect
      value={value}
      onChange={onValueChange}
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
    />
  );
}

const SelectTrigger = ({ children }) => children;
const SelectContent = ({ children }) => children;
const SelectItem = ({ children }) => children;
const SelectValue = ({ children }) => children;
const SelectGroup = ({ children }) => children;
const SelectLabel = ({ children }) => children;
const SelectSeparator = () => null;
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
