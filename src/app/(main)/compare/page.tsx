"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, ArrowRight, Search, Plus, X, BarChart3,
  Sparkles, MapPin, ShieldCheck, Zap, Users, Brush,
  Star, Fingerprint, AlertTriangle, Check,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";
import type { HotelAnalysis } from "@/lib/ai";

interface SavedItem {
  id: string;
  hotelName: string;
  location: string;
  aiScore: number | null;
  analysis: HotelAnalysis | null;
}

const CATEGORIES = [
  { label: "Lokacija", icon: <MapPin size={16} /> },
  { label: "Čistoća", icon: <Brush size={16} /> },
  { label: "Osoblje", icon: <Users size={16} /> },
  { label: "Kreveti i sobe", icon: <Star size={16} /> },
  { label: "Doručak", icon: <Zap size={16} /> },
  { label: "WiFi", icon: <Fingerprint size={16} /> },
  { label: "Vrednost za novac", icon: <BarChart3 size={16} /> },
];

function CompareRow({
  label,
  icon,
  val1,
  val2,
  best,
  isDark,
}: {
  label: string;
  icon: React.ReactNode;
  val1: number;
  val2: number;
  best: 1 | 2 | 0;
  isDark: boolean;
}) {
  const getBarColor = (score: number) => {
    if (score >= 8.5) return "bg-emerald-500";
    if (score >= 7) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="compare-grid-layout border-b border-white/5 hover:bg-white/5 transition-colors group relative">
      <div className="p-6 md:p-10 flex items-center gap-4 border-r border-white/5">
        <div className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0">
          {icon}
        </div>
        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 italic leading-none">
          {label}
        </span>
      </div>

      <div
        className={`p-8 md:p-10 text-center border-l border-white/5 ${
          best === 1 ? "bg-emerald-500/[0.03]" : ""
        }`}
      >
        <div
          className={`text-3xl md:text-5xl font-black italic tracking-tighter leading-none ${
            best === 1
              ? "text-emerald-500"
              : isDark
                ? "text-slate-500"
                : "text-slate-700"
          }`}
        >
          {val1.toFixed(1)}
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden shadow-inner">
          <div
            className={`h-full ${getBarColor(val1)} shadow-[0_0_10px_currentColor]`}
            style={{ width: `${val1 * 10}%` }}
          />
        </div>
      </div>

      <div
        className={`p-8 md:p-10 text-center border-l border-white/5 ${
          best === 2 ? "bg-emerald-500/[0.03]" : ""
        }`}
      >
        <div
          className={`text-3xl md:text-5xl font-black italic tracking-tighter leading-none ${
            best === 2
              ? "text-emerald-500"
              : isDark
                ? "text-slate-500"
                : "text-slate-700"
          }`}
        >
          {val2.toFixed(1)}
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden shadow-inner">
          <div
            className={`h-full ${getBarColor(val2)} shadow-[0_0_10px_currentColor]`}
            style={{ width: `${val2 * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DiffItem({
  icon,
  text,
  color,
  isDark,
}: {
  icon: React.ReactNode;
  text: string;
  color: "emerald" | "rose";
  isDark: boolean;
}) {
  return (
    <li className="flex items-start gap-4 group">
      <div
        className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border ${
          color === "emerald"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
        }`}
      >
        {icon}
      </div>
      <p
        className={`text-sm font-semibold italic leading-snug ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {text}
      </p>
    </li>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [selected, setSelected] = useState<(SavedItem | null)[]>([null, null]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<number | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const items = await res.json();
        const withAnalysis = items.map((item: SavedItem) => ({
          ...item,
          analysis: item.analysis || null,
        }));
        setSaved(withAnalysis);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const selectHotel = (index: number, hotel: SavedItem) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = hotel;
      return next;
    });
    setPicking(null);
  };

  const removeHotel = (index: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const hotel1 = selected[0]?.analysis;
  const hotel2 = selected[1]?.analysis;
  const canCompare = hotel1 && hotel2;

  // Determine overall winner
  const winnerName = canCompare
    ? hotel1.aiScore >= hotel2.aiScore
      ? hotel1.hotelName
      : hotel2.hotelName
    : "";
  const winnerScore = canCompare
    ? Math.max(hotel1.aiScore, hotel2.aiScore)
    : 0;
  const loserName = canCompare
    ? hotel1.aiScore < hotel2.aiScore
      ? hotel1.hotelName
      : hotel2.hotelName
    : "";

  return (
    <main className="flex-1 relative overflow-x-hidden">
      {/* Inline styles for compare grid and VS badge */}
      <style>{`
        .compare-grid-layout {
          display: grid;
          grid-template-columns: 160px 1fr 1fr;
          align-items: center;
        }
        @media (max-width: 768px) {
          .compare-grid-layout {
            grid-template-columns: 90px 1fr 1fr;
          }
        }
        .vs-badge {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 40;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-style: italic;
          font-size: 14px;
          color: white;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Ambient glow */}
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

      <div className="max-w-6xl mx-auto px-4 md:px-10 pb-32 relative z-10">
        {/* Page Header */}
        <PageHeader label="Forenzicko Poredjenje" />

        {/* Hero heading */}
        <div className="mb-12 px-2">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={18} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 italic leading-none">
              Multi-Agent Intelligence
            </span>
          </div>
          <h1 className="text-gradient text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
            Uporedni Dosije
          </h1>
          <p
            className={`font-semibold italic text-sm md:text-lg max-w-2xl leading-relaxed ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Digitalna forenzika identifikuje tehnicke prednosti i prikrivene
            rizike izmedju dva odabrana objekta.
          </p>
        </div>

        {/* Hotel Selectors */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* VS Badge between selectors */}
          {selected[0] && selected[1] && (
            <div className="hidden md:flex vs-badge">VS</div>
          )}

          {[0, 1].map((i) => (
            <div key={i}>
              {selected[i] ? (
                <div className="glass-card p-8 rounded-[40px] bento-hover border-indigo-500/20 relative">
                  {/* Winner badge */}
                  {canCompare &&
                    selected[i]!.hotelName === winnerName && (
                      <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-2">
                        <Trophy size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                          Pobjednik
                        </span>
                      </div>
                    )}

                  <div className="flex items-start gap-5 mb-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[24px] shadow-2xl border-2 border-white/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none">
                        {selected[i]!.hotelName}
                      </h3>
                      <div className="flex items-center gap-2 mt-3">
                        <MapPin
                          size={12}
                          className="text-indigo-500 flex-shrink-0"
                        />
                        <p
                          className={`text-[10px] font-bold uppercase tracking-widest italic leading-none ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          {selected[i]!.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {selected[i]!.aiScore && (
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-black italic text-indigo-400">
                          {selected[i]!.aiScore!.toFixed(1)}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest italic ${
                            isDark ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          AI Score
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeHotel(i)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        isDark
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-black/5 hover:bg-black/10"
                      }`}
                    >
                      <X
                        size={16}
                        className={isDark ? "text-slate-400" : "text-slate-500"}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPicking(i)}
                  className={`glass-card p-10 rounded-[40px] w-full flex flex-col items-center justify-center gap-4 transition-all bento-hover border-dashed min-h-[180px] cursor-pointer ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${
                      isDark ? "bg-white/5" : "bg-black/5"
                    }`}
                  >
                    <Plus
                      size={28}
                      className={isDark ? "text-slate-600" : "text-slate-400"}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-widest italic ${
                      isDark ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    Izaberi hotel {i + 1}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Picker Modal */}
        {picking !== null && (
          <div className="glass-card rounded-[45px] p-8 md:p-10 mb-10 animate-fade-in bento-hover">
            <div className="flex items-center gap-3 mb-6">
              <Search size={18} className="text-indigo-500" />
              <h3
                className={`text-[11px] font-black uppercase tracking-[0.3em] italic ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Izaberi sacuvani hotel
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : saved.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className={`text-sm mb-6 font-semibold italic ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Nemas sacuvanih analiza za poredjenje.
                </p>
                <button
                  onClick={() => router.push("/search")}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Search size={16} /> Pretrazi smestaj
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto hide-scrollbar">
                {saved
                  .filter((s) => !selected.some((sel) => sel?.id === s.id))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectHotel(picking, item)}
                      className={`w-full flex items-center gap-4 p-5 rounded-[20px] transition-all text-left cursor-pointer group ${
                        isDark
                          ? "hover:bg-white/5"
                          : "hover:bg-indigo-50/50"
                      }`}
                    >
                      {item.aiScore && (
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black italic text-indigo-400 text-sm flex-shrink-0 border border-indigo-500/20">
                          {item.aiScore.toFixed(1)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {item.hotelName}
                        </p>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-widest italic leading-none mt-1 ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          {item.location}
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-slate-600 group-hover:text-indigo-400 transition-colors"
                      />
                    </button>
                  ))}
              </div>
            )}

            <button
              onClick={() => setPicking(null)}
              className={`mt-6 text-[10px] font-black uppercase tracking-widest italic transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-500 hover:text-white"
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              Otkazi
            </button>
          </div>
        )}

        {/* Comparison Engine Table */}
        {canCompare && (
          <div className="animate-fade-in-up">
            {/* Comparison Table */}
            <div className="relative glass-card rounded-[50px] overflow-hidden border-white/5 mb-12">
              <div className="hidden md:flex vs-badge">VS</div>

              {/* Table Header */}
              <div className="compare-grid-layout bg-white/5 border-b border-white/5 relative">
                <div className="p-6 md:p-10" />
                <div className="p-6 md:p-10 text-center relative border-l border-white/5 bg-emerald-500/5">
                  {hotel1.aiScore >= hotel2.aiScore && (
                    <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-2">
                      <Trophy size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                        Pobjednik
                      </span>
                    </div>
                  )}
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[24px] mx-auto mb-4 shadow-2xl border-2 border-white/20" />
                  <h3 className="text-sm md:text-xl font-black italic uppercase leading-none tracking-tighter">
                    {hotel1.hotelName}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <MapPin size={12} className="text-indigo-500" />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest italic leading-none ${
                        isDark ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      {hotel1.location}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-10 text-center border-l border-white/5">
                  {hotel2.aiScore > hotel1.aiScore && (
                    <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-2">
                      <Trophy size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                        Pobjednik
                      </span>
                    </div>
                  )}
                  <div
                    className={`w-16 h-16 md:w-24 md:h-24 rounded-[24px] mx-auto mb-4 shadow-xl border ${
                      isDark
                        ? "bg-slate-800 border-white/5"
                        : "bg-slate-200 border-black/5"
                    }`}
                  />
                  <h3 className="text-sm md:text-xl font-black italic uppercase leading-none tracking-tighter opacity-70">
                    {hotel2.hotelName}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <MapPin
                      size={12}
                      className={isDark ? "text-slate-600" : "text-slate-400"}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest italic leading-none ${
                        isDark ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      {hotel2.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Score row */}
              <CompareRow
                label="AI Truth"
                icon={<Fingerprint size={16} />}
                val1={hotel1.aiScore}
                val2={hotel2.aiScore}
                best={
                  hotel1.aiScore > hotel2.aiScore
                    ? 1
                    : hotel2.aiScore > hotel1.aiScore
                      ? 2
                      : 0
                }
                isDark={isDark}
              />

              {/* Google Rating row */}
              {(hotel1.googleRating || hotel2.googleRating) && (
                <CompareRow
                  label="Google"
                  icon={<Star size={16} />}
                  val1={hotel1.googleRating || 0}
                  val2={hotel2.googleRating || 0}
                  best={
                    (hotel1.googleRating || 0) > (hotel2.googleRating || 0)
                      ? 1
                      : (hotel2.googleRating || 0) >
                          (hotel1.googleRating || 0)
                        ? 2
                        : 0
                  }
                  isDark={isDark}
                />
              )}

              {/* Category rows */}
              {CATEGORIES.map((cat) => {
                const s1 = hotel1.scores.find((s) =>
                  s.category
                    .toLowerCase()
                    .includes(cat.label.toLowerCase().slice(0, 4))
                );
                const s2 = hotel2.scores.find((s) =>
                  s.category
                    .toLowerCase()
                    .includes(cat.label.toLowerCase().slice(0, 4))
                );
                const score1 = s1?.score || 0;
                const score2 = s2?.score || 0;

                return (
                  <CompareRow
                    key={cat.label}
                    label={cat.label}
                    icon={cat.icon}
                    val1={score1}
                    val2={score2}
                    best={
                      score1 > score2 ? 1 : score2 > score1 ? 2 : 0
                    }
                    isDark={isDark}
                  />
                );
              })}
            </div>

            {/* Sustinske Razlike */}
            <h3
              className={`text-[12px] font-black uppercase tracking-[0.5em] italic mb-8 px-2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Sustinske Razlike
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
              {/* Hotel 1 Pros */}
              <div className="glass-card p-10 rounded-[45px] border-emerald-500/10 bento-hover">
                <div className="flex items-center gap-3 mb-8 leading-none">
                  <Trophy size={20} className="text-emerald-500" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-500">
                    {hotel1.hotelName} Prednosti
                  </h4>
                </div>
                <ul className="space-y-6">
                  {hotel1.pros.slice(0, 4).map((p, i) => (
                    <DiffItem
                      key={i}
                      icon={<Check size={16} />}
                      text={p}
                      color="emerald"
                      isDark={isDark}
                    />
                  ))}
                </ul>
              </div>

              {/* Hotel 2 Cons / Risks */}
              <div className="glass-card p-10 rounded-[45px] border-rose-500/10 bento-hover">
                <div className="flex items-center gap-3 mb-8 leading-none">
                  <AlertTriangle size={20} className="text-rose-500" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-500">
                    {hotel2.hotelName} Rizici
                  </h4>
                </div>
                <ul className="space-y-6">
                  {hotel2.cons.slice(0, 4).map((c, i) => (
                    <DiffItem
                      key={i}
                      icon={<X size={16} />}
                      text={c}
                      color="rose"
                      isDark={isDark}
                    />
                  ))}
                </ul>
              </div>

              {/* Hotel 2 Pros */}
              <div className="glass-card p-10 rounded-[45px] border-emerald-500/10 bento-hover">
                <div className="flex items-center gap-3 mb-8 leading-none">
                  <Trophy size={20} className="text-emerald-500" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-500">
                    {hotel2.hotelName} Prednosti
                  </h4>
                </div>
                <ul className="space-y-6">
                  {hotel2.pros.slice(0, 4).map((p, i) => (
                    <DiffItem
                      key={i}
                      icon={<Check size={16} />}
                      text={p}
                      color="emerald"
                      isDark={isDark}
                    />
                  ))}
                </ul>
              </div>

              {/* Hotel 1 Cons / Risks */}
              <div className="glass-card p-10 rounded-[45px] border-rose-500/10 bento-hover">
                <div className="flex items-center gap-3 mb-8 leading-none">
                  <AlertTriangle size={20} className="text-rose-500" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-500">
                    {hotel1.hotelName} Rizici
                  </h4>
                </div>
                <ul className="space-y-6">
                  {hotel1.cons.slice(0, 4).map((c, i) => (
                    <DiffItem
                      key={i}
                      icon={<X size={16} />}
                      text={c}
                      color="rose"
                      isDark={isDark}
                    />
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Final Verdict */}
            <div className="glass-card p-12 md:p-20 rounded-[60px] border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent relative group overflow-hidden bento-hover mb-20">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-[4s]">
                <Sparkles size={350} />
              </div>
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-4 mb-8 leading-none">
                  <ShieldCheck size={32} className="text-indigo-400" />
                  <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-indigo-400 italic">
                    Zvanicna AI Presuda
                  </h4>
                </div>
                <p
                  className={`text-2xl md:text-4xl font-black italic leading-[1.1] tracking-tight max-w-5xl mx-auto mb-12 ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  &ldquo;Investicija u{" "}
                  <span className="text-indigo-400">{winnerName}</span> se
                  isplati sa skorom{" "}
                  <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-[10px]">
                    {winnerScore.toFixed(1)}/10
                  </span>
                  . {loserName} zaostaje u kljucnim kategorijama.&rdquo;
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <button
                    onClick={() => {
                      const winnerId =
                        hotel1.aiScore >= hotel2.aiScore
                          ? selected[0]?.id
                          : selected[1]?.id;
                      if (winnerId) router.push(`/hotel/${winnerId}`);
                    }}
                    className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all flex items-center gap-4 group/btn cursor-pointer"
                  >
                    Otvori pobjednicki dosije{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover/btn:translate-x-2 transition-transform"
                    />
                  </button>
                  <button
                    onClick={() => router.push("/search")}
                    className={`px-12 py-5 border rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] transition-all italic leading-none cursor-pointer ${
                      isDark
                        ? "border-white/10 text-slate-500 hover:bg-white/5"
                        : "border-black/10 text-slate-400 hover:bg-black/5"
                    }`}
                  >
                    Nova pretraga
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no hotels selected */}
        {!canCompare && !picking && !selected[0] && !selected[1] && (
          <div className="text-center pt-12 animate-fade-in">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full pulse-ring" />
              <BarChart3
                size={80}
                className={`relative ${
                  isDark ? "text-indigo-500/20" : "text-indigo-500/30"
                }`}
              />
            </div>
            <p
              className={`text-sm font-semibold italic leading-relaxed max-w-md mx-auto mb-10 ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Sacuvaj analize hotela pa ih uporedi ovde. Klikni + iznad da
              izaberes hotele za forenzicko poredjenje.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] active:scale-95 transition-all shadow-2xl shadow-indigo-600/20 cursor-pointer group"
            >
              <Search size={18} /> Pretrazi smestaj{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>
          </div>
        )}

        {/* Footer */}
        <FooterSignature />
      </div>
    </main>
  );
}
