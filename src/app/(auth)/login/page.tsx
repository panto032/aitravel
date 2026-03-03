"use client";

import { Sun, Moon } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { FooterSignature } from "@/components/ui/FooterSignature";
import { useTheme } from "@/lib/theme";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#020205]" : "bg-slate-50"
      }`}
    >
      {/* Background glows */}
      <div
        className={`fixed top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${
          isDark ? "bg-indigo-600/5 opacity-100" : "bg-indigo-500/10 opacity-40"
        }`}
      />
      <div
        className={`fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${
          isDark ? "bg-purple-600/5 opacity-100" : "bg-purple-500/10 opacity-40"
        }`}
      />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 w-12 h-12 glass-card rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-20 ${
          isDark ? "text-yellow-400" : "text-indigo-600"
        }`}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <span
            className={`text-3xl font-black tracking-tighter italic ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Travel
            <span className="text-indigo-500 underline decoration-4 underline-offset-4">
              AI
            </span>
          </span>
          <p
            className={`mt-3 text-sm font-medium ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Otkrij istinu iza recenzija
          </p>
        </div>

        <AuthForm defaultTab="login" />
      </div>

      {/* Footer */}
      <div className="fixed bottom-6 z-10">
        <FooterSignature />
      </div>
    </div>
  );
}
