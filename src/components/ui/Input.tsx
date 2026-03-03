"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-surface-light border border-surface-lighter rounded-2xl px-4 py-4 text-white placeholder-gray-600 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            error ? "border-danger" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
