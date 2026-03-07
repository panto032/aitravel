"use client";

import { useTheme } from "@/lib/theme";

export function FooterSignature() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full flex justify-center py-8 pb-28">
      <p
        className={`text-[11px] font-black uppercase tracking-[0.4em] italic ${
          isDark ? "text-slate-800" : "text-slate-400"
        }`}
      >
        KREIRAO{" "}
        <span className="text-indigo-500 mx-2 underline decoration-2 underline-offset-4">
          IMPULSE
        </span>{" "}
        PART OF{" "}
        <span className="text-indigo-400">IMPULS TECH DOO</span>
      </p>
    </div>
  );
}
