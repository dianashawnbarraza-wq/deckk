"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  multiline?: boolean;
  rows?: number;
  id?: string;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
}

export function FloatingField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  multiline = false,
  rows = 3,
  id: idProp,
  className,
  inputClassName,
  maxLength,
}: FloatingFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const fieldClass = cn(
    "w-full bg-transparent text-base text-ink outline-none transition-[padding]",
    active ? "px-4 pt-7 pb-3" : "px-4 py-3.5 text-center placeholder:text-center",
    multiline && active && "min-h-[7rem] resize-none",
    inputClassName
  );

  return (
    <div
      className={cn(
        "relative rounded-[0.625rem] border bg-paper transition-colors",
        focused ? "border-brand-accent" : "border-line",
        className
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-4 z-10 font-medium text-ink transition-all duration-200",
          active
            ? "top-2.5 text-xs opacity-100"
            : "top-1/2 -translate-y-1/2 text-base text-muted-foreground opacity-0"
        )}
      >
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={active ? undefined : placeholder ?? label}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          className={fieldClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={active ? undefined : placeholder ?? label}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          className={fieldClass}
        />
      )}
    </div>
  );
}
