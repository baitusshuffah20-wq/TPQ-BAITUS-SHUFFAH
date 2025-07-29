"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div
        className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = "",
}) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-gray-300 
        bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = "Select an option",
  className = "",
}) => {
  const { value } = React.useContext(SelectContext);

  return (
    <span className={`block truncate ${className}`}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = "",
}) => {
  const { open, setOpen } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      {/* Content */}
      <div
        className={`
          absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-gray-200 
          bg-white shadow-lg max-h-60 overflow-auto
          ${className}
        `}
      >
        {children}
      </div>
    </>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  className = "",
}) => {
  const {
    value: selectedValue,
    onValueChange,
    setOpen,
  } = React.useContext(SelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm 
        outline-none hover:bg-gray-100 focus:bg-gray-100
        ${isSelected ? "bg-blue-50 text-blue-900" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
