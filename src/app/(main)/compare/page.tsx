"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Trophy, ArrowRight, Search, Plus, X, BarChart3,
} from "lucide-react";
import type { HotelAnalysis } from "@/lib/ai";

interface SavedItem {
  id: string;
  hotelName: string;
  location: string;
  aiScore: number | null;
  analysis: HotelAnalysis | null;
}

const CATEGORIES = [
  "Lokacija",
  "Čistoća",
  "Osoblje",
  "Kreveti i sobe",
  "Doručak",
  "WiFi",
  "Vrednost za novac",
];

function ScoreBar({
  score,
  max = 10,
  isWinner,
}: {
  score: number;
  max?: number;
  isWinner: boolean;
}) {
  const pct = (score / max) * 100;
  const color =
    score >= 8
      ? "bg-emerald-500"
      : score >= 6
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-8 text-right ${isWinner ? "text-indigo-400" : "text-slate-400"}`}>
        {score.toFixed(1)}
      </span>
      {isWinner && <Trophy size={12} className="text-amber-400 flex-shrink-0" />}
    </div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [selected, setSelected] = useState<(SavedItem | null)[]>([null, null]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<number | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const items = await res.json();
        // Fetch full analyses for items that have them
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

  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">
              Uporedna Analiza
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              Izaberi 2 hotela za poređenje
            </p>
          </div>
        </div>

        {/* Hotel Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[0, 1].map((i) => (
            <div key={i}>
              {selected[i] ? (
                <div className="glass-card p-6 rounded-[28px] border-indigo-500/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selected[i]!.hotelName}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {selected[i]!.location}
                      </p>
                    </div>
                    <button
                      onClick={() => removeHotel(i)}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
                    >
                      <X size={14} className="text-slate-400" />
                    </button>
                  </div>
                  {selected[i]!.aiScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black italic text-indigo-400">
                        {selected[i]!.aiScore!.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-600">AI Score</span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setPicking(i)}
                  className="glass-card p-8 rounded-[28px] w-full flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all border-dashed border-white/10 min-h-[120px]"
                >
                  <Plus size={24} className="text-slate-600" />
                  <span className="text-sm text-slate-500 font-bold">
                    Izaberi hotel {i + 1}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Picker Modal */}
        {picking !== null && (
          <div className="glass-card rounded-[28px] p-6 mb-10 animate-fade-in">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
              Izaberi sačuvani hotel
            </h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : saved.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm mb-4">
                  Nemaš sačuvanih analiza za poređenje.
                </p>
                <button
                  onClick={() => router.push("/search")}
                  className="inline-flex items-center gap-2 text-indigo-400 text-sm font-bold"
                >
                  <Search size={16} /> Pretraži smeštaj
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {saved
                  .filter(
                    (s) =>
                      !selected.some((sel) => sel?.id === s.id)
                  )
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectHotel(picking, item)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left"
                    >
                      {item.aiScore && (
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-sm flex-shrink-0">
                          {item.aiScore.toFixed(1)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">
                          {item.hotelName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {item.location}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-slate-600" />
                    </button>
                  ))}
              </div>
            )}
            <button
              onClick={() => setPicking(null)}
              className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Otkaži
            </button>
          </div>
        )}

        {/* Comparison */}
        {canCompare && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={20} className="text-indigo-500" />
              <h3 className="text-xl font-black italic tracking-tighter">
                Poređenje po kategorijama
              </h3>
            </div>

            <div className="space-y-4 mb-10">
              {CATEGORIES.map((cat) => {
                const s1 = hotel1.scores.find(
                  (s) =>
                    s.category.toLowerCase().includes(cat.toLowerCase().slice(0, 4))
                );
                const s2 = hotel2.scores.find(
                  (s) =>
                    s.category.toLowerCase().includes(cat.toLowerCase().slice(0, 4))
                );
                const score1 = s1?.score || 0;
                const score2 = s2?.score || 0;

                return (
                  <div key={cat} className="glass-card p-5 rounded-[20px]">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">
                      {cat}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ScoreBar score={score1} isWinner={score1 > score2} />
                      <ScoreBar score={score2} isWinner={score2 > score1} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Winner */}
            <div className="glass-card p-8 rounded-[35px] text-center border-amber-500/20 bg-amber-500/[0.02]">
              <Trophy size={32} className="text-amber-400 mx-auto mb-3" />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Ukupni pobednik
              </div>
              <div className="text-2xl font-black italic text-white">
                {hotel1.aiScore >= hotel2.aiScore
                  ? hotel1.hotelName
                  : hotel2.hotelName}
              </div>
              <div className="text-indigo-400 font-bold text-lg mt-1">
                {Math.max(hotel1.aiScore, hotel2.aiScore).toFixed(1)}/10
              </div>
            </div>

            {/* Pros/Cons Side by Side */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              {[hotel1, hotel2].map((hotel, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-bold text-white mb-3">{hotel.hotelName}</h4>
                  <div className="glass-card p-4 rounded-[20px] mb-3 border-emerald-500/10">
                    <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-2">
                      Prednosti
                    </div>
                    {hotel.pros.slice(0, 3).map((p, i) => (
                      <p key={i} className="text-xs text-slate-400 mb-1">
                        + {p}
                      </p>
                    ))}
                  </div>
                  <div className="glass-card p-4 rounded-[20px] border-rose-500/10">
                    <div className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-2">
                      Mane
                    </div>
                    {hotel.cons.slice(0, 3).map((c, i) => (
                      <p key={i} className="text-xs text-slate-400 mb-1">
                        - {c}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no hotels selected */}
        {!canCompare && !picking && !selected[0] && !selected[1] && (
          <div className="text-center pt-8 animate-fade-in">
            <BarChart3 size={64} className="text-indigo-500/20 mx-auto mb-6" />
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto mb-8">
              Sačuvaj analize hotela pa ih uporedi ovde. Klikni + iznad da izabereš hotele.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Search size={18} /> Pretraži smeštaj <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
