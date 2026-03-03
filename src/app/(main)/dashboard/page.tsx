"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Sparkles, TrendingUp, ShieldCheck, ArrowRight,
  Home, Plane, Car, Palmtree, Utensils, Globe, Clock, Zap,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";

const categories = [
  { name: "Hoteli", icon: <Home size={28} />, active: true },
  { name: "Letovi", icon: <Plane size={28} />, active: false },
  { name: "Rent a car", icon: <Car size={28} />, active: false },
  { name: "Plaze", icon: <Palmtree size={28} />, active: false },
  { name: "Restorani", icon: <Utensils size={28} />, active: false },
];

interface PopularHotel {
  name: string;
  location: string;
  aiScore: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  photoUrl: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const firstName = session?.user?.name?.split(" ")[0] || "Putnice";
  const [popularHotels, setPopularHotels] = useState<PopularHotel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/public/showcase")
      .then((r) => r.json())
      .then((data) => {
        if (data.hotels && data.hotels.length > 0) {
          setPopularHotels(
            data.hotels.slice(0, 3).map((h: PopularHotel) => ({
              name: h.name,
              location: h.location,
              aiScore: h.aiScore,
              googleRating: h.googleRating,
              googleReviewCount: h.googleReviewCount,
              photoUrl: h.photoUrl,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const displayHotels =
    popularHotels.length > 0
      ? popularHotels
      : [
          { name: "Vila Kostas", location: "Hanioti", aiScore: 8.7, googleRating: null, googleReviewCount: null, photoUrl: null },
          { name: "Aegean Melathron", location: "Kallithea", aiScore: 8.9, googleRating: null, googleReviewCount: null, photoUrl: null },
          { name: "Ikos Olivia", location: "Gerakini", aiScore: 9.4, googleRating: null, googleReviewCount: null, photoUrl: null },
        ];

  const handleHotelClick = (hotel: { name: string; location: string }) => {
    const params = new URLSearchParams({ name: hotel.name, location: hotel.location });
    router.push(`/hotel/detail?${params.toString()}`);
  };

  const handleScan = () => {
    if (!searchQuery) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <div className="px-4 md:px-10">
        <PageHeader label="Dashboard" backHref="/dashboard" />
      </div>

      <main className="flex-1 px-4 md:px-10 pb-8 relative z-10">
        <div className="max-w-6xl mx-auto w-full">

          {/* Welcome + Info Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-500 mb-2 italic">
                Dobar dan, {firstName}
              </h2>
              <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-black leading-[0.85] tracking-tighter uppercase italic">
                Istrazi{" "}
                <span className="text-indigo-500 underline decoration-indigo-500/20 underline-offset-8">
                  istinu.
                </span>
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="glass-card px-6 py-4 rounded-[28px] border-white/5 flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Preostale Analize
                </span>
                <span className="text-xl font-black italic text-indigo-400 leading-none">7 / 10</span>
              </div>
              <div className="glass-card px-6 py-4 rounded-[28px] border-emerald-500/10 flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Status Sistema
                </span>
                <span className="text-xl font-black italic text-emerald-400 leading-none flex items-center gap-2">
                  Online <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative group mb-20">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] group-focus-within:bg-indigo-500/10 transition-all rounded-[60px]" />
            <div className={`relative border rounded-[40px] md:rounded-[50px] p-3 md:p-4 flex items-center gap-4 transition-all ${isDark ? "bg-slate-950/70 border-white/10 shadow-2xl shadow-black" : "bg-white border-black/5 shadow-xl shadow-slate-200"}`}>
              <div className="pl-4 md:pl-6 text-slate-600 group-focus-within:text-indigo-500 transition-colors hidden md:block">
                <Search size={28} />
              </div>
              <input
                type="text"
                placeholder="Zalepi link hotela ili destinaciju..."
                className={`bg-transparent flex-1 h-14 md:h-16 outline-none text-lg md:text-2xl font-black placeholder:text-slate-800 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
              <button
                onClick={handleScan}
                className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white px-8 md:px-12 h-14 md:h-16 rounded-[30px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/40 flex items-center gap-3 active:scale-95 transition-all hover:shadow-indigo-500/50 cursor-pointer"
              >
                <Zap size={18} fill="currentColor" />
                <span className="hidden sm:inline">Skeniraj</span>
              </button>
            </div>
          </div>

          {/* Categories Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-20">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => cat.active && router.push("/search")}
                className={`glass-card p-6 md:p-10 rounded-[40px] border-white/5 transition-all group flex flex-col items-center gap-4 shadow-xl text-center relative ${
                  cat.active ? "hover:border-indigo-500/40 cursor-pointer" : "opacity-50 cursor-default"
                }`}
              >
                <div className={`transition-all group-hover:scale-125 duration-700 ${cat.active ? "text-slate-500 group-hover:text-indigo-400" : "text-slate-600"}`}>
                  {cat.icon}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] italic leading-none ${cat.active ? "text-slate-600 group-hover:text-white" : "text-slate-600"}`}>
                  {cat.name}
                </span>
                {!cat.active && (
                  <span className="absolute -top-2 -right-2 text-[8px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                    USKORO
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Bento Grid: Trending + Recent */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
            {/* Main Trending */}
            <div className="md:col-span-7 glass-card p-10 md:p-14 rounded-[55px] border-indigo-500/20 relative overflow-hidden group bento-hover">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[4s]">
                <Globe size={300} />
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                  <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] italic leading-none">
                    Live AI Travel Pulse
                  </span>
                </div>
                <h3 className={`text-3xl md:text-4xl font-black italic mb-8 leading-[0.9] tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                  Halkidiki je 18% povoljniji u junu 2026.
                </h3>
                <p className={`text-base mb-12 font-semibold italic leading-relaxed max-w-sm ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                  Na osnovu 12,400 recenzija ovog meseca, Hanioti ima najbolji
                  odnos cena/kvalitet.
                </p>
                <button
                  onClick={() => router.push("/search")}
                  className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-indigo-400 cursor-pointer group-hover:translate-x-2 transition-transform italic leading-none"
                >
                  Vidi listu hotela <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Side Cards */}
            <div className="md:col-span-5 flex flex-col gap-8">
              <div className="glass-card flex-1 p-10 rounded-[50px] flex flex-col justify-between border-white/5 group cursor-pointer bento-hover">
                <TrendingUp className="text-indigo-500 group-hover:scale-110 transition-transform" size={48} />
                <div>
                  <h4 className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-[0.5em] italic leading-none">
                    Top Trending
                  </h4>
                  <div className={`text-3xl font-black italic tracking-tighter uppercase leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                    Halkidiki, GR
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-3 tracking-widest italic leading-none">
                    12.4k istraga danas
                  </p>
                </div>
              </div>

              <div className="glass-card flex-1 p-10 rounded-[50px] flex flex-col gap-6 border-white/5 bento-hover">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-none">
                    Nedavne istrage
                  </h4>
                  <Clock size={16} className="text-slate-600" />
                </div>
                <div className="space-y-4">
                  {displayHotels.slice(0, 2).map((h) => (
                    <div
                      key={h.name}
                      onClick={() => handleHotelClick(h)}
                      className={`flex items-center justify-between p-3 glass-card rounded-2xl border-white/5 hover:border-white/10 transition-all cursor-pointer group/item`}
                    >
                      <span className={`text-sm font-bold italic uppercase group-hover/item:text-white transition-colors ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {h.name}
                      </span>
                      <span className="text-xs font-black italic text-indigo-400">
                        {(h.aiScore || 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {session?.user?.role === "ADMIN" && (
            <div className="mb-8">
              <Link
                href="/admin"
                className="glass-card px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400 border-rose-500/20 hover:bg-rose-500/10 transition-all inline-flex"
              >
                Admin Panel
              </Link>
            </div>
          )}

        </div>
      </main>

      <FooterSignature />
    </>
  );
}
