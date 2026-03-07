"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Search, MapPin, Wifi, Coffee, Bed,
  Users, Star, Shield, Check, X as XIcon, ChevronRight,
  Waves, ShieldAlert, Utensils, Coins, Fingerprint,
  CheckCircle2, Zap, MessageSquare, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { FooterSignature } from "@/components/ui/FooterSignature";

interface ShowcaseHotel {
  id: string;
  name: string;
  location: string;
  aiScore: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  photoUrl: string | null;
  summary: string | null;
  pros: string[];
  cons: string[];
  topScores: { category: string; score: number }[];
}

interface ShowcaseData {
  hotels: ShowcaseHotel[];
  stats: { totalReviews: number; totalHotels: number; totalLocations: number };
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.ceil(end / 60));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count.toLocaleString("sr-RS")}
      {suffix}
    </span>
  );
}

function PreviewModal({
  hotel,
  onClose,
  isDark,
}: {
  hotel: ShowcaseHotel;
  onClose: () => void;
  isDark: boolean;
}) {
  const scoreColor =
    (hotel.aiScore || 0) >= 8
      ? "text-emerald-400"
      : (hotel.aiScore || 0) >= 6
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`glass-card rounded-[40px] max-w-lg w-full p-10 animate-fade-in-up ${
          isDark ? "border-white/10" : "border-black/5"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            <div className={`text-5xl font-black italic ${scoreColor} drop-shadow-lg leading-none`}>
              {(hotel.aiScore || 0).toFixed(1)}
            </div>
            <div>
              <h3 className={`text-xl font-black uppercase tracking-tight italic ${isDark ? "text-white" : "text-slate-900"}`}>
                {hotel.name}
              </h3>
              <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">
                AI Detektivski Sken
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Top Categories */}
        {hotel.topScores.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {hotel.topScores.slice(0, 4).map((s) => {
              const catColor = s.score >= 8 ? "emerald" : s.score >= 6 ? "amber" : "rose";
              return (
                <div
                  key={s.category}
                  className={`glass-card p-4 rounded-2xl border-${catColor}-500/20 text-${catColor}-500 text-xs font-black uppercase tracking-widest text-center`}
                >
                  {s.category} {s.score.toFixed(1)}
                </div>
              );
            })}
          </div>
        )}

        {/* Pros / Cons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <div className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-2">
              Prednosti
            </div>
            {hotel.pros.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{p}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs text-rose-400 font-black uppercase tracking-widest mb-2">
              Mane
            </div>
            {hotel.cons.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1">
                <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/register"
          className="btn-glow w-full h-14 bg-indigo-600 text-white rounded-[22px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          Prikaži kompletan dosije
        </Link>
        <p className={`text-center text-xs mt-4 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          Za kompletnu analizu sa svim kategorijama
        </p>
      </div>
    </div>
  );
}

const categoryShowcase = [
  { icon: <Waves size={20} />, name: "Lokacija" },
  { icon: <ShieldAlert size={20} />, name: "Bezbednost" },
  { icon: <Bed size={20} />, name: "San" },
  { icon: <Coffee size={20} />, name: "Hrana" },
  { icon: <Wifi size={20} />, name: "Wi-Fi" },
  { icon: <Utensils size={20} />, name: "Nearby" },
  { icon: <Coins size={20} />, name: "Vrednost" },
];

const testimonials = [
  { user: "Marko P.", text: "Konacno neko ko mi kaze istinu pre nego sto uplatim. AI je tacno predvideo problem sa liftom.", loc: "Beograd" },
  { user: "Jelena M.", text: "Skenirala sam hotel koji posecujem godinama - AI je izvukao tacno ono sto i ja mislim!", loc: "Novi Sad" },
  { user: "Dragan S.", text: "Interfejs je buducnost. Brzo, jasno i sustinski vazno za svakog putnika.", loc: "Nis" },
  { user: "Ana K.", text: "Vise ne rezervisem dok ne proverim ovde. Ustedelo mi je bar 200EUR proslog meseca.", loc: "Zagreb" },
];

export default function LandingPage() {
  const [showcase, setShowcase] = useState<ShowcaseData | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<ShowcaseHotel | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetch("/api/public/showcase")
      .then((r) => r.json())
      .then(setShowcase)
      .catch(() => {});
  }, []);

  const stats = showcase?.stats || {
    totalReviews: 1000,
    totalHotels: 50,
    totalLocations: 10,
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 selection:bg-indigo-500/30 overflow-x-hidden ${isDark ? "bg-[#020205] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Ambient Lights */}
      <div className={`fixed top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${isDark ? "bg-indigo-600/5 opacity-100" : "bg-indigo-500/10 opacity-40"}`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${isDark ? "bg-purple-600/5 opacity-100" : "bg-purple-500/10 opacity-40"}`} />

      {/* HEADER */}
      <header className={`h-16 md:h-24 px-4 md:px-10 flex justify-between items-center z-[100] sticky top-0 backdrop-blur-xl border-b transition-all ${isDark ? "bg-[#020205]/60 border-white/5 shadow-2xl shadow-black/20" : "bg-white/70 border-black/5 shadow-sm"}`}>
        <div className={`text-xl md:text-3xl font-black tracking-tight italic ${isDark ? "text-white" : "text-slate-900"}`}>
          Travel<span className="text-indigo-500 underline decoration-2 md:decoration-4 underline-offset-4">AI</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 md:p-3 rounded-xl transition-all border cursor-pointer ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:text-yellow-400" : "bg-black/5 border-black/5 text-slate-600 hover:text-indigo-600"}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            href="/login"
            className="btn-glow bg-indigo-600 text-white px-5 md:px-10 py-2.5 rounded-2xl font-bold text-xs md:text-sm uppercase tracking-widest active:scale-95 transition-all"
          >
            Prijavi se
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto relative">
        {/* 1. HERO */}
        <section className="text-center pt-16 md:pt-32 pb-32 px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-5 py-2 rounded-full border border-emerald-500/20 mb-10 animate-bounce shadow-lg shadow-emerald-500/5">
            <span className="text-xs font-black uppercase tracking-widest leading-none italic">
              Besplatno — Zauvek
            </span>
          </div>
          <h1 className="text-gradient text-5xl sm:text-7xl md:text-[110px] font-black leading-[0.85] tracking-tighter uppercase italic mb-10">
            Putuj bez <br />
            <span className="text-indigo-500 underline decoration-indigo-500/20 underline-offset-[12px]">
              maski.
            </span>
          </h1>
          <p className={`text-lg md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed font-semibold italic ${isDark ? "text-slate-500" : "text-slate-600"}`}>
            Prva platforma koja analizira hiljade recenzija pomocu AI agenata
            kako bi ti pokazala sta se stvarno desava u hotelu.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20">
            <Link
              href="/register"
              className="btn-glow w-full md:w-auto bg-indigo-600 text-white px-14 py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Search size={18} /> Zapocni istragu
            </Link>
            <Link
              href="/login"
              className={`w-full md:w-auto px-14 py-6 rounded-[28px] font-black text-sm uppercase tracking-widest border transition-all text-center ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-slate-900 shadow-xl"}`}
            >
              Vec imam nalog
            </Link>
          </div>

          {/* Demo cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Vila Kostas", loc: "Hanioti", issue: "Otkrivena Buka", score: "8.7", color: "rose" },
              { name: "Hotel Aegean", loc: "Kallithea", issue: "Lazne Slike", score: "6.4", color: "amber" },
              { name: "Ikos Olivia", loc: "Gerakini", issue: "Top Favorit", score: "9.4", color: "emerald" },
            ].map((card) => (
              <div
                key={card.name}
                className="glass-card p-6 rounded-[35px] hover:border-indigo-500/40 hover:-translate-y-2 transition-all text-left flex flex-col justify-between h-40 group shadow-xl cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-500 font-black italic text-sm`}>
                    {card.score}
                  </div>
                  <ArrowRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${card.color}-500`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest text-${card.color}-500 italic`}>
                      {card.issue}
                    </span>
                  </div>
                  <h4 className={`text-lg font-black uppercase tracking-tight italic leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                    {card.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
                    {card.loc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. KAKO RADI */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 md:mb-48">
          {[
            { num: "1", title: "Pretrazi", text: "Ukucaj ime ili link bilo kog hotela. Nas sistem pronalazi verifikovane podatke.", icon: <Search className="text-indigo-500" size={24} /> },
            { num: "2", title: "Analiza", text: "AI agenti analiziraju sve: od buke do kvaliteta duseka u sekundi.", icon: <Fingerprint className="text-purple-500" size={24} /> },
            { num: "3", title: "Istina", text: "Dobijas izvestaj koji razbija marketing. Saznaj sta se krije iza lepih slika.", icon: <Shield className="text-emerald-500" size={24} /> },
          ].map((step) => (
            <div key={step.num} className="glass-card p-10 rounded-[45px] hover:border-indigo-500/40 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-all border border-indigo-500/20 shadow-lg">
                  {step.icon}
                </div>
                <span className="text-5xl font-black italic opacity-10 leading-none tracking-tighter">
                  {step.num}
                </span>
              </div>
              <h4 className={`text-xl font-black mb-4 uppercase tracking-tighter italic leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                {step.title}
              </h4>
              <p className={`text-sm font-medium leading-relaxed italic ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                {step.text}
              </p>
            </div>
          ))}
        </section>

        {/* 3. STATS */}
        <section className="glass-card p-12 md:p-24 rounded-[60px] text-center border-indigo-500/10 mx-6 mb-32 md:mb-48 relative z-10">
          <div className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500 mb-12 italic opacity-80 leading-none">
            Status Sistema
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { val: Math.max(stats.totalReviews, 1000), suffix: "+", label: "Recenzija Analizirano" },
              { val: Math.max(stats.totalHotels, 50), suffix: "+", label: "Verifikovanih Hotela" },
              { val: Math.max(stats.totalLocations, 10), suffix: "+", label: "Pokrivenih Destinacija" },
            ].map((s) => (
              <div key={s.label} className="group cursor-default">
                <div className={`text-3xl md:text-5xl font-black italic tracking-tighter mb-4 transition-all group-hover:text-indigo-500 group-hover:scale-105 duration-700 ${isDark ? "text-white" : "text-slate-900"}`}>
                  <CountUp end={s.val} suffix={s.suffix} />
                </div>
                <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 italic opacity-80">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SHOWCASE */}
        {showcase && showcase.hotels.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 mb-32 md:mb-48">
            <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-16 ${isDark ? "text-white" : "text-slate-900"}`}>
              Showcase Rezultati
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {showcase.hotels.slice(0, 3).map((hotel) => {
                const scoreColor =
                  (hotel.aiScore || 0) >= 8 ? "indigo" : (hotel.aiScore || 0) >= 6 ? "amber" : "rose";
                const badge =
                  (hotel.aiScore || 0) >= 8 ? "Best Value" : (hotel.aiScore || 0) >= 6 ? "Verified" : "Risk Alert";

                return (
                  <div
                    key={hotel.id}
                    onClick={() => setSelectedHotel(hotel)}
                    className="glass-card rounded-[50px] overflow-hidden group cursor-pointer border-white/5 hover:-translate-y-2 transition-all"
                  >
                    <div className="h-64 bg-slate-900/50 relative p-10 flex flex-col justify-between overflow-hidden border-b border-white/5">
                      {hotel.photoUrl && (
                        <img
                          src={hotel.photoUrl}
                          alt={hotel.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className={`absolute top-0 right-0 w-48 h-48 bg-${scoreColor}-500/10 blur-[70px] pointer-events-none transition-all duration-1000 group-hover:scale-150`} />
                      <div className="flex justify-between items-start relative z-10">
                        <div className={`bg-${scoreColor === "rose" ? "rose" : "indigo"}-600 text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl`}>
                          {badge}
                        </div>
                        <div className={`w-14 h-14 glass-card rounded-2xl flex items-center justify-center font-black italic text-xl text-${scoreColor === "rose" ? "rose" : "indigo"}-400 border-white/10`}>
                          {(hotel.aiScore || 0).toFixed(1)}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-white italic leading-tight uppercase tracking-tighter relative z-10">
                        {hotel.name}
                      </h3>
                    </div>
                    <div className="p-10 relative">
                      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        {hotel.location}
                      </p>
                      {hotel.summary && (
                        <p className={`text-sm italic leading-relaxed mb-8 line-clamp-3 font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                          &quot;{hotel.summary}&quot;
                        </p>
                      )}
                      <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500 flex items-center gap-4 group-hover:text-white transition-all italic leading-none group-hover:translate-x-2">
                        DETALJI <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. DUBOKA AI ANALIZA */}
        <section className="max-w-7xl mx-auto px-6 mb-32 md:mb-48 text-center">
          <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-16 ${isDark ? "text-white" : "text-slate-900"}`}>
            Duboka AI Analiza
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 px-2">
            {categoryShowcase.map((cat) => (
              <div
                key={cat.name}
                className="glass-card p-6 rounded-[35px] flex flex-col items-center gap-3 group hover:border-indigo-500/30 transition-all shadow-xl"
              >
                <div className="text-slate-500 group-hover:text-indigo-400 transition-all duration-500 group-hover:scale-110">
                  {cat.icon}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest group-hover:text-indigo-400 transition-colors leading-none italic ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. TESTIMONIALS */}
        <section className="mb-32 md:mb-48 px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
              Glas Putnika
            </h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 italic">
              Sta kazu oni koji vise ne veruju marketingu
            </p>
          </div>
          <div className="overflow-x-auto hide-scrollbar pb-4">
            <div className="flex gap-6 px-4 w-max">
              {testimonials.map((t) => (
                <div
                  key={t.user}
                  className="glass-card p-10 rounded-[45px] w-80 md:w-96 flex flex-col justify-between border-white/5 shadow-2xl relative overflow-hidden flex-shrink-0"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <MessageSquare size={80} className="text-indigo-500" />
                  </div>
                  <div>
                    <div className="flex gap-1 mb-6 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className={`text-base italic leading-relaxed mb-10 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      &quot;{t.text}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg italic shadow-lg">
                      {t.user[0]}
                    </div>
                    <div>
                      <div className={`text-sm font-black uppercase tracking-widest italic ${isDark ? "text-white" : "text-slate-900"}`}>
                        {t.user}
                      </div>
                      <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60">
                        {t.loc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. PRICING */}
        <section className="max-w-7xl mx-auto px-6 mb-32 md:mb-48">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="glass-card p-10 md:p-16 rounded-[60px] border-indigo-500/10 relative overflow-hidden flex flex-col justify-between">
              <div>
                <h2 className={`text-4xl md:text-6xl font-black italic mb-8 leading-none uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                  BESPLATNO.<br />ZAUVEK.
                </h2>
                <div className="space-y-6 mb-12">
                  {[
                    "10 AI analiza mesecno besplatno",
                    "Kompletan izvestaj o manama hotela",
                    "Cuvanje omiljenih destinacija",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-4 group cursor-default">
                      <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className={`text-base md:text-lg font-bold italic group-hover:text-white transition-colors leading-none tracking-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/register"
                className="btn-glow bg-indigo-600 text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center"
              >
                Kreiraj nalog besplatno
              </Link>
            </div>

            {/* Premium */}
            <div className="glass-card p-10 md:p-16 rounded-[60px] border-purple-500/20 bg-gradient-to-br from-purple-600/5 to-transparent relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-8 right-8 bg-purple-500 text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest animate-pulse z-20 shadow-lg shadow-purple-500/20">
                U PRIPREMI
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000 z-10">
                <Zap size={200} />
              </div>
              <div className="relative z-10">
                <h2 className={`text-4xl md:text-6xl font-black italic mb-2 leading-none uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                  PREMIUM.
                </h2>
                <div className="text-2xl font-black text-purple-400 mb-8 italic uppercase tracking-tight">
                  590 RSD <span className="text-xs opacity-60">/ mesec</span>
                </div>
                <div className="space-y-6 mb-12">
                  {[
                    "Neogranicen broj izvestaja",
                    "Kompletna istorija pretraga",
                    "Ekskluzivni AI trendovi putovanja",
                    "Prioritetna analiza novih hotela",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-4 group/item cursor-default">
                      <div className="w-8 h-8 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-all border border-purple-500/20">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className={`text-base md:text-lg font-bold italic group-hover/item:text-white transition-colors leading-none tracking-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                disabled
                className="bg-white/5 border border-white/10 text-slate-500 px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest cursor-not-allowed italic"
              >
                Uskoro dostupno
              </button>
            </div>
          </div>
        </section>

        {/* 8. FOOTER */}
        <footer className={`py-14 px-8 transition-colors border-t mt-10 ${isDark ? "border-white/5" : "border-black/5"}`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className={`flex flex-wrap justify-center md:justify-start gap-8 text-xs font-black uppercase tracking-[0.2em] italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Link href="/uslovi" className="hover:text-indigo-500 transition-colors">
                Uslovi Koriscenja
              </Link>
              <Link href="/privatnost" className="hover:text-indigo-500 transition-colors">
                Politika Privatnosti
              </Link>
              <Link href="/o-nama" className="hover:text-indigo-500 transition-colors">
                O nama
              </Link>
            </div>
            <div className="text-center md:text-right">
              <p className={`text-xs font-black uppercase tracking-[0.2em] italic leading-relaxed ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                TRAVELAI SYSTEM &copy; 2026 — KREIRAO{" "}
                <span className="text-indigo-500">IMPULSE</span> PART OF{" "}
                <span className="text-indigo-400 tracking-widest">IMPULS TECH DOO</span>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Preview Modal */}
      {selectedHotel && (
        <PreviewModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
