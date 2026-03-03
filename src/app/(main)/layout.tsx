"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { WifiOff } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [offline, setOffline] = useState(false);

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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-x-hidden">
      {/* Background glows */}
      <div
        className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 blur-[120px] pointer-events-none rounded-full"
        style={{ opacity: "var(--glow-opacity)" }}
      />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 blur-[120px] pointer-events-none rounded-full"
        style={{ opacity: "var(--glow-opacity)" }}
      />

      {/* Offline banner */}
      {offline && (
        <div className="fixed top-0 left-0 right-0 z-[300] bg-amber-500/90 backdrop-blur-sm text-black text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold">
          <WifiOff size={16} />
          Nema interneta — prikazujem sačuvane podatke
        </div>
      )}

      <div className="max-w-6xl mx-auto min-h-screen relative flex flex-col">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
