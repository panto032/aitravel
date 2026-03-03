"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Trash2,
  Search,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Square,
  Zap,
  Sparkles,
  Filter,
  BarChart3,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";

interface SavedItem {
  id: string;
  hotelName: string;
  location: string;
  aiScore: number | null;
  analysis: Record<string, unknown> | null;
  createdAt: string;
}

function getScoreColor(score: number | null): {
  bg: string;
  border: string;
  text: string;
  status: string;
} {
  if (!score) return { bg: "bg-slate-500/20", border: "border-slate-500/40", text: "text-slate-400", status: "N/A" };
  if (score >= 7.5) return { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", status: "Odlican" };
  if (score >= 5.5) return { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400", status: "Prosek" };
  return { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-400", status: "Rizik" };
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "danas";
  if (diffDays === 1) return "juce";
  if (diffDays < 7) return `pre ${diffDays} dana`;
  if (diffDays < 30) return `pre ${Math.floor(diffDays / 7)} ned.`;
  return new Date(dateStr).toLocaleDateString("sr-RS");
}

export default function SavedPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/saved");
      if (res.ok) setItems(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/saved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      }
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const handleClick = (item: SavedItem) => {
    const params = new URLSearchParams({
      name: item.hotelName,
      location: item.location,
    });
    router.push(`/hotel/detail?${params.toString()}`);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    const selected = items.filter((item) => selectedIds.includes(item.id));
    const params = new URLSearchParams();
    selected.forEach((item) => {
      params.append("hotels", `${item.hotelName}|${item.location}`);
    });
    router.push(`/compare?${params.toString()}`);
  };

  const filteredItems = items.filter(
    (item) =>
      item.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 px-4 md:px-10 pb-32 pt-4 relative">
      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Page Header */}
        <PageHeader label="Sacuvani Dosijei" />

        {/* Hero Heading */}
        <div className="mb-10 px-1">
          <h1 className="text-gradient text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
            Moji Hoteli
          </h1>
          <p
            className={`font-semibold italic text-sm md:text-lg ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Tvoj personalni trezor analiziranih objekata — dostupan offline.
          </p>
        </div>

        {/* Stats Bar */}
        {!loading && items.length > 0 && (
          <div className="glass-card rounded-[28px] p-5 mb-8 flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                }`}
              >
                <BarChart3
                  size={14}
                  className={isDark ? "text-indigo-400" : "text-indigo-600"}
                />
              </div>
              <div>
                <p
                  className={`text-[9px] font-black uppercase tracking-widest italic ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  Ukupno
                </p>
                <p
                  className={`text-sm font-black italic ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {items.length}
                </p>
              </div>
            </div>
            <div
              className={`w-px h-8 ${isDark ? "bg-white/5" : "bg-black/5"}`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                }`}
              >
                <Sparkles
                  size={14}
                  className={isDark ? "text-emerald-400" : "text-emerald-600"}
                />
              </div>
              <div>
                <p
                  className={`text-[9px] font-black uppercase tracking-widest italic ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  Izabrano
                </p>
                <p
                  className={`text-sm font-black italic ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  {selectedIds.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search / Filter Bar */}
        {!loading && items.length > 0 && (
          <div className="mb-8">
            <div
              className={`glass-card rounded-[28px] flex items-center gap-3 px-6 py-4 ${
                isDark
                  ? "focus-within:border-indigo-500/30"
                  : "focus-within:border-indigo-300"
              } transition-all`}
            >
              <Search
                size={18}
                className={isDark ? "text-slate-600" : "text-slate-400"}
              />
              <input
                type="text"
                placeholder="Pretrazi sacuvane hotele..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm font-semibold italic placeholder:italic ${
                  isDark
                    ? "text-white placeholder:text-slate-700"
                    : "text-slate-900 placeholder:text-slate-400"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`text-[9px] font-black uppercase tracking-widest ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  Resetuj
                </button>
              )}
              <Filter
                size={16}
                className={isDark ? "text-slate-700" : "text-slate-300"}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-6">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${
                  isDark ? "bg-indigo-500/10" : "bg-indigo-50"
                }`}
              >
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            </div>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${
                isDark ? "text-slate-700" : "text-slate-400"
              }`}
            >
              Ucitavanje arhive...
            </p>
          </div>
        ) : filteredItems.length === 0 && searchQuery ? (
          /* No search results */
          <div className="text-center pt-16 animate-fade-in">
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-[24px] flex items-center justify-center ${
                isDark ? "bg-white/[0.02]" : "bg-slate-100"
              }`}
            >
              <Search
                size={32}
                className={isDark ? "text-slate-700" : "text-slate-300"}
              />
            </div>
            <h2
              className={`text-xl font-black italic uppercase tracking-tight mb-3 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Nema rezultata
            </h2>
            <p
              className={`text-sm font-medium leading-relaxed max-w-sm mx-auto mb-6 ${
                isDark ? "text-slate-600" : "text-slate-500"
              }`}
            >
              Nijedan sacuvani hotel ne odgovara pretrazi &ldquo;{searchQuery}
              &rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className={`text-[10px] font-black uppercase tracking-widest italic ${
                isDark
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-indigo-600 hover:text-indigo-500"
              } transition-colors`}
            >
              Ponisti pretragu
            </button>
          </div>
        ) : items.length === 0 ? (
          /* Empty state - no saved items */
          <div className="text-center pt-16 animate-fade-in">
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div
                className={`absolute inset-0 rounded-[28px] ${
                  isDark ? "bg-indigo-500/10" : "bg-indigo-50"
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Star
                  size={40}
                  className={isDark ? "text-indigo-500/40" : "text-indigo-300"}
                />
              </div>
              <div
                className={`absolute -inset-4 rounded-full blur-2xl ${
                  isDark ? "bg-indigo-600/10" : "bg-indigo-100/50"
                } pulse-ring`}
              />
            </div>
            <h2
              className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-3 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Trezor je prazan
            </h2>
            <p
              className={`text-sm font-semibold italic leading-relaxed max-w-sm mx-auto mb-10 ${
                isDark ? "text-slate-600" : "text-slate-500"
              }`}
            >
              Pokreni novu istragu da sacuvas dosije. Sacuvani hoteli su
              dostupni i offline.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] italic active:scale-95 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40"
            >
              <Search size={16} /> Pokreni istragu
            </button>
          </div>
        ) : (
          /* Saved Items List */
          <div className="space-y-6 mb-16 animate-fade-in-up">
            {filteredItems.map((item) => {
              const scoreColors = getScoreColor(item.aiScore);
              const isSelected = selectedIds.includes(item.id);
              const isDeleting = deletingId === item.id;
              const analysis = item.analysis as Record<string, unknown> | null;
              const googleRating = analysis?.googleRating as number | undefined;
              const summary = analysis?.summary as string | undefined;

              return (
                <div
                  key={item.id}
                  className={`glass-card rounded-[35px] overflow-hidden bento-hover shadow-xl flex flex-col md:flex-row group transition-all duration-300 ${
                    isDeleting ? "opacity-50 scale-[0.98]" : ""
                  } ${
                    isSelected
                      ? isDark
                        ? "ring-1 ring-indigo-500/30"
                        : "ring-1 ring-indigo-400/30"
                      : ""
                  }`}
                >
                  {/* Left: Score Visual Area */}
                  <div
                    className={`relative w-full md:w-48 h-28 md:h-auto overflow-hidden cursor-pointer ${
                      isDark ? "bg-slate-900/50" : "bg-slate-100"
                    }`}
                    onClick={() => handleClick(item)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        isDark
                          ? "from-indigo-900/30 to-purple-900/30"
                          : "from-indigo-100/60 to-purple-100/60"
                      } group-hover:scale-110 transition-transform duration-700`}
                    />
                    {/* AI Score Badge */}
                    {item.aiScore && (
                      <div
                        className={`absolute bottom-4 left-4 w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-lg shadow-2xl border ${scoreColors.bg} ${scoreColors.border} ${scoreColors.text}`}
                      >
                        {item.aiScore.toFixed(1)}
                      </div>
                    )}
                    {/* Status Label */}
                    <div
                      className={`absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest italic px-3 py-1.5 rounded-full border ${scoreColors.bg} ${scoreColors.border} ${scoreColors.text}`}
                    >
                      {scoreColors.status}
                    </div>
                  </div>

                  {/* Center: Info Area */}
                  <div
                    className="flex-1 p-6 md:p-8 flex flex-col justify-center cursor-pointer"
                    onClick={() => handleClick(item)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div>
                        <h3
                          className={`text-lg md:text-xl font-black italic uppercase leading-tight tracking-tight transition-colors ${
                            isDark
                              ? "text-white group-hover:text-indigo-400"
                              : "text-slate-900 group-hover:text-indigo-600"
                          }`}
                        >
                          {item.hotelName}
                        </h3>
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mt-1.5 italic ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          <MapPin
                            size={10}
                            className={
                              isDark ? "text-indigo-500" : "text-indigo-400"
                            }
                          />{" "}
                          {item.location}
                        </div>
                      </div>

                      {/* Google Rating + Status */}
                      <div className="flex items-center gap-4">
                        {googleRating && (
                          <div className="flex flex-col">
                            <span
                              className={`text-[8px] font-black uppercase italic leading-none ${
                                isDark ? "text-slate-600" : "text-slate-400"
                              }`}
                            >
                              Google
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500 font-black italic text-sm">
                              <Star size={12} fill="currentColor" />{" "}
                              {googleRating.toFixed(1)}
                            </div>
                          </div>
                        )}
                        {googleRating && (
                          <div
                            className={`w-px h-6 ${
                              isDark ? "bg-white/5" : "bg-black/10"
                            }`}
                          />
                        )}
                        <div className="flex flex-col">
                          <span
                            className={`text-[8px] font-black uppercase italic leading-none ${
                              isDark ? "text-slate-600" : "text-slate-400"
                            }`}
                          >
                            Status
                          </span>
                          <div
                            className={`font-black italic text-sm uppercase leading-none mt-1 ${scoreColors.text}`}
                          >
                            {item.aiScore ? "Audit OK" : "Ceka"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {summary && (
                      <p
                        className={`text-xs font-semibold italic mb-4 line-clamp-1 ${
                          isDark ? "text-slate-500" : "text-slate-500"
                        }`}
                      >
                        &ldquo;{summary}&rdquo;
                      </p>
                    )}

                    {/* Bottom bar: date + details link */}
                    <div
                      className={`flex items-center justify-between border-t pt-4 ${
                        isDark ? "border-white/5" : "border-black/5"
                      }`}
                    >
                      <span
                        className={`text-[9px] font-bold uppercase italic tracking-widest leading-none ${
                          isDark ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        Sacuvano {formatRelativeDate(item.createdAt)}
                      </span>
                      <div
                        className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic group-hover:translate-x-1 transition-transform ${
                          isDark ? "text-indigo-400" : "text-indigo-600"
                        }`}
                      >
                        Detalji <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Select + Delete) */}
                  <div
                    className={`flex md:flex-col items-center justify-center gap-3 p-4 md:p-6 border-t md:border-t-0 md:border-l transition-colors ${
                      isDark ? "border-white/5" : "border-black/5"
                    } ${isSelected ? (isDark ? "bg-indigo-500/5" : "bg-indigo-50/50") : ""}`}
                  >
                    <button
                      onClick={() => toggleSelection(item.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-90 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : isDark
                            ? "border-white/10 text-slate-600 hover:border-indigo-500/30 hover:text-indigo-400"
                            : "border-black/10 text-slate-400 hover:border-indigo-400/30 hover:text-indigo-600"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 size={24} strokeWidth={3} />
                      ) : (
                        <Square size={24} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                        isDark
                          ? "border-white/5 text-slate-700 hover:text-rose-500 hover:border-rose-500/30"
                          : "border-black/5 text-slate-300 hover:text-rose-500 hover:border-rose-400/30"
                      } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <FooterSignature />
      </div>

      {/* Floating Compare Button */}
      {selectedIds.length >= 2 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[150] animate-fade-in">
          <button
            onClick={handleCompare}
            className={`flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] italic shadow-2xl transition-all active:scale-95 cursor-pointer ${
              isDark
                ? "bg-indigo-600/90 border border-indigo-500/40 text-white shadow-indigo-900/60 hover:bg-indigo-500"
                : "bg-indigo-600 border border-indigo-400 text-white shadow-indigo-300/50 hover:bg-indigo-500"
            } backdrop-blur-xl`}
          >
            <Zap size={16} fill="currentColor" />
            Uporedi ({selectedIds.length})
          </button>
        </div>
      )}
    </main>
  );
}
