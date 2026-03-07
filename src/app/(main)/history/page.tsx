"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Trash2, Clock, ArrowRight, Globe, MapPin, Filter,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";

interface HistoryHotel {
  hotelName: string;
  location: string;
  aiScore?: number;
  googlePlaceId?: string;
  googleRating?: number;
  photoUrl?: string;
}

interface HistoryEntry {
  id: string;
  query: string;
  results: {
    destination?: string;
    summary?: string;
    results?: HistoryHotel[];
    location?: string;
    aiScore?: number;
    method?: string;
  } | null;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenSearch = (item: HistoryEntry) => {
    // Navigate to search page — results load from SearchCache (instant, no re-analysis)
    router.push(`/search?q=${encodeURIComponent(item.query)}`);
  };

  const handleOpenHotel = (hotel: HistoryHotel) => {
    const params = new URLSearchParams({ name: hotel.hotelName, location: hotel.location });
    if (hotel.googlePlaceId) params.set("placeId", hotel.googlePlaceId);
    router.push(`/hotel/detail?${params.toString()}`);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.results?.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Danas, ${date.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Juce, ${date.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("sr-RS", { day: "numeric", month: "short" }) +
        `, ${date.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  const getScoreStatus = (score?: number) => {
    if (!score) return "indigo";
    if (score >= 8) return "emerald";
    if (score >= 6) return "amber";
    return "rose";
  };

  const statusStyles: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/20",
    rose: "text-rose-500 bg-rose-500/5 border-rose-500/20",
    indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/20",
  };

  return (
    <>
      <div className="px-4 md:px-10">
        <PageHeader label="Digitalni Dnevnik" backHref="/dashboard" />
      </div>

      <main className="flex-1 px-4 md:px-10 pb-8 relative z-10">
        <div className="max-w-4xl mx-auto w-full">
          {/* Heading */}
          <div className="mb-12 px-2">
            <h1 className="text-gradient text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              Arhiva Istraga
            </h1>
            <p className={`font-semibold italic text-sm md:text-lg leading-relaxed ${isDark ? "text-slate-500" : "text-slate-600"}`}>
              Hronoloski zapis svih pokrenutih neuralnih skenova i destinacija.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-10 px-2">
            <div className="flex-1 relative group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                className={`w-full pl-12 pr-6 py-4 rounded-[22px] glass-card outline-none font-bold text-sm focus:border-indigo-500/30 ${isDark ? "text-white" : "text-slate-900"}`}
                placeholder="Pretrazi arhivu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={`w-14 h-14 glass-card rounded-[22px] flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer ${isDark ? "text-slate-500 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}>
              <Filter size={20} />
            </button>
          </div>

          {/* Timeline Divider */}
          <div className="flex items-center gap-4 mb-8 px-4 opacity-30">
            <div className="h-px flex-1 bg-current" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">
              Timeline Logs
            </span>
            <div className="h-px flex-1 bg-current" />
          </div>

          {/* History Feed */}
          <div className="space-y-4 mb-16">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className={`text-sm font-bold uppercase tracking-widest italic ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  Ucitavanje arhive...
                </p>
              </div>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item) => {
                const hotels = item.results?.results || [];
                const destination = item.results?.destination || item.results?.location;
                const hotelCount = hotels.length;

                return (
                  <div key={item.id} className="space-y-2">
                    {/* Search Header Row */}
                    <div
                      className="glass-card p-5 md:p-6 rounded-[30px] bento-hover shadow-lg flex items-center gap-4 md:gap-6 group cursor-pointer"
                      onClick={() => handleOpenSearch(item)}
                    >
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 shrink-0 text-indigo-400 bg-indigo-500/5 border-indigo-500/20">
                        <Search size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5 leading-none">
                          <span className="text-[11px] font-bold text-slate-500 italic flex items-center gap-1.5 leading-none">
                            <Clock size={10} /> {formatDate(item.createdAt)}
                          </span>
                          {hotelCount > 0 && (
                            <>
                              <div className="w-1 h-1 rounded-full bg-slate-800" />
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 italic leading-none">
                                {hotelCount} hotela
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className={`text-base md:text-xl font-black italic uppercase leading-none tracking-tight truncate mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {item.query}
                        </h3>
                        {destination && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-widest italic leading-none">
                            <MapPin size={10} className="text-indigo-500" />{" "}
                            {destination}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-700 hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSearch(item);
                          }}
                        >
                          <ArrowRight size={18} />
                        </button>
                        <button
                          className={`w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                            deleting === item.id
                              ? "text-rose-500 animate-pulse"
                              : "text-slate-700 hover:text-rose-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Hotel Sub-items (top 3) */}
                    {hotels.slice(0, 3).map((hotel) => {
                      const score = hotel.aiScore;
                      const status = getScoreStatus(score);
                      return (
                        <div
                          key={hotel.hotelName}
                          className="ml-6 md:ml-10 glass-card p-4 rounded-[22px] flex items-center gap-4 group/hotel cursor-pointer hover:border-indigo-500/20 transition-all"
                          onClick={() => handleOpenHotel(hotel)}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${statusStyles[status]}`}>
                            {score ? (
                              <span className="font-black italic text-sm leading-none">{score.toFixed(1)}</span>
                            ) : (
                              <Globe size={16} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-black italic uppercase leading-none tracking-tight truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {hotel.hotelName}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-bold italic leading-none">{hotel.location}</span>
                          </div>
                          <ArrowRight size={14} className="text-slate-600 group-hover/hotel:text-indigo-400 transition-colors shrink-0" />
                        </div>
                      );
                    })}
                    {hotels.length > 3 && (
                      <div
                        className="ml-6 md:ml-10 text-center py-2 text-[11px] font-black uppercase tracking-widest text-indigo-500 italic cursor-pointer hover:text-indigo-400 transition-colors"
                        onClick={() => handleOpenSearch(item)}
                      >
                        + jos {hotels.length - 3} hotela
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center opacity-30">
                <Search size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest italic">
                  {searchQuery
                    ? "Nema rezultata za pretragu"
                    : "Nema sacuvanih istraga"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <FooterSignature />
    </>
  );
}
