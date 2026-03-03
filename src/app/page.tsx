"use client";

import Link from "next/link";
import { Target, ArrowRight, ShieldCheck, Sparkles, Search } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="h-20 px-6 md:px-10 flex justify-between items-center relative z-10">
        <div className="text-xl font-black tracking-tighter italic flex items-center gap-2">
          <Target size={24} className="text-indigo-500" />
          Travel<span className="text-indigo-500 underline decoration-4 underline-offset-4">AI</span>
        </div>
        <Link
          href="/login"
          className="text-sm text-slate-500 hover:text-white transition-colors font-bold"
        >
          Prijavi se
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-6 text-center pt-16 md:pt-24 pb-20 relative z-10">
        <div className="max-w-2xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 mb-8">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Pokreće ga veštačka inteligencija
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-gradient italic">
            Pronađi istinu
            <br />
            u recenzijama.
          </h1>

          <p className="text-slate-500 text-base md:text-xl leading-relaxed font-medium mb-12 max-w-lg mx-auto">
            AI analizira recenzije sa Booking-a, Google-a, TripAdvisor-a.
            Otkrij šta se krije iza marketinga.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 px-8 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40"
            >
              Kreiraj nalog <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="h-14 glass-card rounded-2xl font-bold text-sm text-slate-400 flex items-center justify-center gap-3 px-8 hover:bg-white/5 transition-all"
            >
              Već imam nalog
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 max-w-lg w-full mt-20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {[
            { icon: <Search size={24} />, label: "Agregacija recenzija" },
            { icon: <Sparkles size={24} />, label: "AI analiza" },
            { icon: <ShieldCheck size={24} />, label: "Verifikovani podaci" },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-card rounded-[28px] p-6 text-center group hover:bg-white/5 transition-all"
            >
              <div className="text-indigo-400 flex justify-center mb-3 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
