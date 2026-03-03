"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target, Search, Sparkles, TrendingUp, ShieldCheck, ArrowRight,
  Home, Plane, Car, Palmtree, Utensils, Bell, Clock,
} from "lucide-react";

const categories = [
  { name: "Smještaj", icon: <Home size={20} />, active: true },
  { name: "Letovi", icon: <Plane size={20} />, active: false },
  { name: "Rent a car", icon: <Car size={20} />, active: false },
  { name: "Agencije", icon: <Palmtree size={20} />, active: false },
  { name: "Restorani", icon: <Utensils size={20} />, active: false },
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
  const firstName = session?.user?.name?.split(" ")[0] || "Putniče";
  const [popularHotels, setPopularHotels] = useState<PopularHotel[]>([]);

  useEffect(() => {
    // Fetch popular from showcase (public API)
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

  // Fallback hotels if no cached data
  const displayHotels =
    popularHotels.length > 0
      ? popularHotels
      : [
          { name: "Vila Kostas", location: "Hanioti", aiScore: 8.7, googleRating: null, googleReviewCount: null, photoUrl: null },
          { name: "Aegean Melathron", location: "Kallithea", aiScore: 8.9, googleRating: null, googleReviewCount: null, photoUrl: null },
          { name: "Ikos Olivia", location: "Gerakini", aiScore: 9.4, googleRating: null, googleReviewCount: null, photoUrl: null },
        ];

  const handleHotelClick = (hotel: { name: string; location: string }) => {
    const params = new URLSearchParams({
      name: hotel.name,
      location: hotel.location,
    });
    router.push(`/hotel/detail?${params.toString()}`);
  };

  return (
    <>
      {/* Header */}
      <header className="h-16 md:h-24 px-6 md:px-10 flex justify-between items-center z-[100] sticky top-0 bg-[#020205]/80 backdrop-blur-md">
        <div className="text-xl md:text-2xl font-black tracking-tighter italic flex items-center gap-2 text-white cursor-pointer group">
          <Target
            size={24}
            className="text-indigo-500 group-hover:rotate-45 transition-transform"
          />
          Travel
          <span className="text-indigo-500 underline decoration-4 underline-offset-4">
            AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="glass-card px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400 border-rose-500/20 hover:bg-rose-500/10 transition-all"
            >
              Admin
            </Link>
          )}
          <button className="hidden md:flex glass-card p-3 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <Bell size={20} />
          </button>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center p-[1px] cursor-pointer ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all"
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[11px] flex items-center justify-center text-white text-sm font-black">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 md:px-10 pb-32 pt-4">
        <div className="max-w-5xl mx-auto w-full">
          {/* Hero */}
          <div className="max-w-2xl mb-10 animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-[1.05] tracking-tight text-gradient">
              Zdravo,{" "}
              <span className="text-indigo-400 italic">{firstName}</span>.
              <br />
              Kuda putuješ?
            </h1>
            <p className="text-slate-500 text-sm md:text-xl leading-relaxed font-medium">
              AI analizira hiljade recenzija umjesto tebe. Otkrij šta se krije
              iza marketinga.
            </p>
          </div>

          {/* Search Bar */}
          <div
            className="relative group mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl group-focus-within:bg-indigo-500/15 transition-all rounded-3xl" />
            <div className="relative bg-slate-900/40 border border-white/5 rounded-[32px] p-4 flex items-center gap-4 focus-within:border-indigo-500/50 transition-all shadow-2xl shadow-black">
              <Search size={24} className="ml-2 text-slate-500" />
              <input
                type="text"
                placeholder="Hotel, destinacija, agencija..."
                className="bg-transparent flex-1 h-12 outline-none text-base md:text-lg font-semibold text-white placeholder:text-slate-700"
                onFocus={() => router.push("/search")}
                readOnly
              />
              <button
                onClick={() => router.push("/search")}
                className="hidden md:flex bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95"
              >
                Pretraži
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="flex gap-3 overflow-x-auto pb-8 hide-scrollbar mb-4 -mx-2 px-2 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => cat.active && router.push("/search")}
                className={`flex-shrink-0 glass-card p-4 md:px-6 rounded-[24px] flex flex-col md:flex-row items-center gap-3 border-white/5 transition-all group min-w-[100px] md:min-w-0 relative ${
                  cat.active
                    ? "hover:border-indigo-500/40"
                    : "opacity-50 cursor-default"
                }`}
              >
                <div
                  className={`transition-colors ${
                    cat.active
                      ? "text-slate-400 group-hover:text-indigo-400"
                      : "text-slate-600"
                  }`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`text-[11px] md:text-sm font-black uppercase tracking-widest transition-colors ${
                    cat.active
                      ? "text-slate-500 group-hover:text-white"
                      : "text-slate-600"
                  }`}
                >
                  {cat.name}
                </span>
                {!cat.active && (
                  <span className="absolute -top-2 -right-2 text-[8px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                    USKORO
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Trending Section */}
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 items-stretch animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="md:col-span-8 flex flex-col justify-between glass-card p-8 rounded-[40px] border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.05] to-transparent">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase text-indigo-400">
                    AI Monthly Insight
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black italic mb-4">
                  Halkidiki je 18% povoljniji u junu 2026.
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-lg mb-6">
                  Na osnovu 12,400 recenzija ovog mjeseca, Hanioti ima najbolji
                  odnos cijena/kvalitet. Izbjegavaj &quot;Hotel Poseidon&quot; -
                  AI detektuje rastuće žalbe na buku.
                </p>
              </div>
              <button
                onClick={() => router.push("/search")}
                className="w-fit flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Pogledaj analizu <ArrowRight size={16} />
              </button>
            </div>

            <div className="md:col-span-4 grid grid-cols-1 gap-4">
              <div className="glass-card p-6 rounded-[35px] border-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col justify-center">
                <TrendingUp
                  size={24}
                  className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform"
                />
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                  Top Destinacija
                </div>
                <div className="font-bold text-xl text-white italic">
                  Santorini, GR
                </div>
                <div className="text-[10px] text-slate-600 font-bold mt-2">
                  2.3k Novih analiza
                </div>
              </div>
              <div className="glass-card p-6 rounded-[35px] border-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer group flex flex-col justify-center">
                <ShieldCheck
                  size={24}
                  className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform"
                />
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                  Status Sistema
                </div>
                <div className="font-bold text-xl text-white">
                  99.4% Tačnost
                </div>
              </div>
            </div>
          </div>

          {/* Popular Analyses */}
          <h2
            className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-white tracking-tighter italic animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <Target size={24} className="text-indigo-500" /> Najpopularnije
            Analize
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {displayHotels.map((hotel, i) => (
              <div
                key={i}
                className="glass-card rounded-[35px] flex flex-col justify-between hover:bg-white/5 transition-all cursor-pointer border-white/5 group relative overflow-hidden"
                onClick={() => handleHotelClick(hotel)}
              >
                {/* Photo if available */}
                {hotel.photoUrl && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={hotel.photoUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-lg italic">
                      {(hotel.aiScore || 0).toFixed(1)}
                    </div>
                    {hotel.googleRating && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-white font-bold text-sm">
                          {hotel.googleRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">
                      {hotel.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {hotel.location}
                      {hotel.googleReviewCount
                        ? ` • ${hotel.googleReviewCount.toLocaleString("sr-RS")} recenzija`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
