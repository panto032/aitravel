"use client";

import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/40",
    secondary:
      "bg-surface-light border border-surface-lighter text-white hover:border-primary/50",
    ghost: "bg-transparent text-gray-400 hover:text-white",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Ucitavanje...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
