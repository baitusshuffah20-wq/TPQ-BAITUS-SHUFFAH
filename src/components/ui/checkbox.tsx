"use client";

import * as React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
  id,
}) => {
  const handleChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleChange}
      disabled={disabled}
      id={id}
      className={`
        peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
        focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${
          checked
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white hover:bg-gray-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </button>
  );
};
