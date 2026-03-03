"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { WifiOff } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [offline, setOffline] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    setOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 selection:bg-indigo-500/30 overflow-x-hidden ${
        isDark ? "bg-[#020205] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Ambient background glow */}
      <div
        className={`fixed top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${
          isDark
            ? "bg-indigo-600/5 opacity-100"
            : "bg-indigo-500/10 opacity-40"
        }`}
      />
      <div
        className={`fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${
          isDark
            ? "bg-purple-600/5 opacity-100"
            : "bg-purple-500/10 opacity-40"
        }`}
      />

      {/* Offline banner */}
      {offline && (
        <div className="fixed top-0 left-0 right-0 z-[300] bg-amber-500/90 backdrop-blur-sm text-black text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold">
          <WifiOff size={16} />
          Nema interneta — prikazujem sacuvane podatke
        </div>
      )}

      <div className="max-w-6xl mx-auto min-h-screen relative flex flex-col z-10">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
