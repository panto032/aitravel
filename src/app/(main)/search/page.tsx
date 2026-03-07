"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Sparkles, Fingerprint, MapPin, Star,
  List, Map as MapIcon, Loader2, X,
  BarChart3, Zap, ArrowRight, Check, Filter,
} from "lucide-react";
import type { SearchResponse, SearchResult } from "@/lib/ai";
import { fetchSearch } from "@/lib/api-client";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/* ============================================
   SCANNING SCREEN — Radar/Fingerprint Animation
   ============================================ */
function ScanningScreen({ query, isDark }: { query: string; isDark: boolean }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Pitam AI agenta...",
    "Pretrazujem Google Places...",
    "Spajam rezultate...",
  ];

  useState(() => {
    const t1 = setTimeout(() => setStep(1), 1500);
    const t2 = setTimeout(() => setStep(2), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  });

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in">
      {/* Radar container */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-16 animate-float">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 border border-indigo-500/20 rounded-full pulse-ring" />
        <div className="absolute inset-6 border border-purple-500/15 rounded-full pulse-ring" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-12 border border-indigo-500/10 rounded-full pulse-ring" style={{ animationDelay: "1s" }} />

        {/* Spinning orbit rings */}
        <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite]" />
        <div className="absolute inset-12 border border-emerald-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse]" />

        {/* Center scanner */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden relative glass-card shadow-2xl ${
            isDark ? "border-indigo-500/20" : "border-indigo-300/30"
          }`}>
            <div className="scanning-active-line" />
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Fingerprint size={64} className={`${isDark ? "text-indigo-400" : "text-indigo-600"} opacity-60`} />
              <div className={`text-xs font-black tracking-[0.4em] uppercase italic ${
                isDark ? "text-indigo-500" : "text-indigo-600"
              }`}>
                Deep Scanning
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className={`text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-3 ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        Analiziram &quot;{query}&quot;...
      </h2>
      <p className={`text-xs font-black uppercase tracking-[0.3em] italic opacity-80 mb-6 ${
        isDark ? "text-indigo-400" : "text-indigo-600"
      }`}>
        {steps[step] || steps[0]}
      </p>
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i <= step
                ? "bg-indigo-500 shadow-lg shadow-indigo-500/50"
                : isDark ? "bg-white/10" : "bg-black/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================
   RESULT CARD — Premium Glassmorphism Card
   ============================================ */
function ResultCard({
  result,
  onClick,
  isDark,
}: {
  result: SearchResult;
  onClick: () => void;
  isDark: boolean;
}) {
  const scoreColor =
    result.aiScore >= 8
      ? "emerald"
      : result.aiScore >= 6
        ? "amber"
        : "rose";

  const scoreBg =
    scoreColor === "emerald"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
      : scoreColor === "amber"
        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
        : "bg-rose-500/20 border-rose-500/40 text-rose-400";

  const scoreBarColor =
    scoreColor === "emerald"
      ? "bg-emerald-500"
      : scoreColor === "amber"
        ? "bg-amber-500"
        : "bg-rose-500";

  // Use Google photo or fallback to Unsplash
  const imageUrl =
    result.photoUrl ||
    `https://source.unsplash.com/600x400/?${encodeURIComponent(
      `${result.location} hotel resort`
    )}`;

  return (
    <div
      className="glass-card rounded-[35px] md:rounded-[45px] overflow-hidden group cursor-pointer bento-hover flex flex-col h-full"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden bg-slate-900/80">
        <img
          src={imageUrl}
          alt={result.hotelName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />

        {/* Verified badge - top left */}
        {result.verified && (
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
            <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 px-3 py-1 md:px-4 md:py-1.5 rounded-[10px] md:rounded-[12px] text-[11px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xl">
              <Check size={10} strokeWidth={4} /> Verifikovano
            </div>
          </div>
        )}

        {/* AI Score badge - bottom right */}
        <div className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 w-16 h-16 md:w-18 md:h-18 rounded-[18px] md:rounded-[22px] flex flex-col items-center justify-center font-black italic shadow-2xl border transition-all group-hover:rotate-6 ${scoreBg}`}>
          <span className="text-[7px] md:text-[11px] uppercase not-italic opacity-60 leading-none mb-1 font-black">AI Score</span>
          <span className="text-2xl md:text-3xl leading-none tracking-tighter">{result.aiScore.toFixed(1)}</span>
        </div>

        {/* Hotel name & location - bottom left */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20 pr-20">
          <h3 className={`text-lg md:text-xl font-black italic uppercase leading-[0.95] tracking-tight group-hover:text-indigo-400 transition-colors ${
            isDark ? "text-white" : "text-white"
          }`}>
            {result.hotelName}
          </h3>
          <div className="flex items-center gap-1.5 text-white/50 text-[11px] md:text-xs font-bold uppercase tracking-widest mt-2">
            <MapPin size={10} className="text-indigo-400" /> {result.location}
          </div>
        </div>

        {/* Price badge - top right */}
        {result.priceRange && result.priceRange !== "N/A" && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 glass-card rounded-[12px] px-3 py-1.5 text-right">
            <div className={`text-sm font-black leading-none ${isDark ? "text-white" : "text-white"}`}>
              {result.priceRange}
            </div>
            <div className="text-[7px] text-white/50 font-bold uppercase tracking-wider mt-0.5">po noci</div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-8 flex flex-col gap-4 md:gap-6">
        {/* Stats Bar */}
        <div className={`flex justify-between items-center rounded-[20px] p-3 md:p-4 border transition-colors ${
          isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
        }`}>
          <div className="flex flex-col gap-0.5">
            <span className={`text-[7px] md:text-[11px] font-black uppercase tracking-widest italic leading-none ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}>Google</span>
            <div className="flex items-center gap-1.5 text-yellow-500 font-black italic text-sm md:text-base">
              <Star size={14} fill="currentColor" />
              {result.googleRating ? result.googleRating.toFixed(1) : "N/A"}
            </div>
          </div>
          <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
          <div className="flex flex-col gap-0.5">
            <span className={`text-[7px] md:text-[11px] font-black uppercase tracking-widest italic leading-none ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}>AI Trust</span>
            <div className="flex items-center gap-1.5 text-indigo-500 font-black italic text-sm md:text-base">
              <BarChart3 size={14} /> {result.aiScore.toFixed(1)}
            </div>
          </div>
          <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
          <div className="text-right flex flex-col">
            <span className={`text-[7px] md:text-[11px] font-black uppercase tracking-widest italic ${
              isDark ? "text-slate-600" : "text-slate-400"
            }`}>Volume</span>
            <span className={`text-xs md:text-[11px] font-black italic leading-none ${
              isDark ? "text-slate-400" : "text-slate-900"
            }`}>
              {result.googleReviewCount
                ? result.googleReviewCount.toLocaleString("sr-RS")
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Summary text */}
        <p className={`text-xs leading-relaxed font-medium ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          {result.shortSummary}
        </p>

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {result.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                  isDark
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-indigo-600 bg-indigo-100"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Score Progress Bar */}
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
          isDark ? "bg-white/5" : "bg-black/5"
        }`}>
          <div
            className={`h-full ${scoreBarColor} rounded-full transition-all`}
            style={{ width: `${result.aiScore * 10}%` }}
          />
        </div>

        {/* CTA Link */}
        <div className="flex items-center justify-between group/link">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Zap size={12} fill="currentColor" />
            </div>
            <span className="text-[11px] md:text-[11px] font-black uppercase tracking-[0.25em] text-indigo-500 italic leading-none">
              Otvori dosije
            </span>
          </div>
          <div className={`flex items-center gap-2 group-hover/link:translate-x-1 transition-all ${
            isDark ? "text-indigo-400" : "text-indigo-600"
          }`}>
            <span className="text-[11px] font-black italic uppercase opacity-0 group-hover/link:opacity-100 transition-opacity">
              Detalji
            </span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MAP VIEW — MapLibre GL
   ============================================ */
function MapView({
  results,
  onHotelClick,
  isDark,
}: {
  results: SearchResult[];
  onHotelClick: (r: SearchResult) => void;
  isDark: boolean;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<SearchResult | null>(null);

  const withCoords = results.filter((r) => r.latitude && r.longitude);

  useEffect(() => {
    if (!mapContainer.current || withCoords.length === 0 || mapRef.current) return;

    const center: [number, number] = [
      withCoords.reduce((sum, r) => sum + r.longitude! / withCoords.length, 0),
      withCoords.reduce((sum, r) => sum + r.latitude! / withCoords.length, 0),
    ];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: isDark
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: center as [number, number],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    withCoords.forEach((r) => {
      const color = r.aiScore >= 8 ? "#10b981" : r.aiScore >= 6 ? "#f59e0b" : "#ef4444";

      const el = document.createElement("div");
      el.className = "map-marker";
      el.style.cssText = `width:36px;height:36px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:white;box-shadow:0 4px 15px ${color}66;`;
      el.textContent = r.aiScore.toFixed(1);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedHotel(r);
      });

      new maplibregl.Marker({ element: el })
        .setLngLat([r.longitude!, r.latitude!])
        .addTo(map);
    });

    // Fit bounds
    if (withCoords.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      withCoords.forEach((r) => bounds.extend([r.longitude!, r.latitude!]));
      map.fitBounds(bounds, { padding: 60 });
    }

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withCoords.length]);

  if (withCoords.length === 0) {
    return (
      <div className={`glass-card rounded-[40px] md:rounded-[60px] p-12 text-center border-indigo-500/10 relative overflow-hidden ${
        isDark ? "" : ""
      }`}>
        <div className={`absolute inset-0 opacity-50 ${
          isDark ? "bg-gradient-to-br from-indigo-950/20 to-purple-950/20" : "bg-gradient-to-br from-indigo-100 to-purple-100"
        }`} />
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 pulse-ring mx-auto relative z-10 ${
          isDark ? "bg-indigo-500/10 text-indigo-500" : "bg-white text-indigo-600 shadow-xl"
        }`}>
          <MapIcon size={32} strokeWidth={1.5} />
        </div>
        <h3 className={`text-xl md:text-3xl font-black uppercase tracking-tighter italic relative z-10 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}>Nema koordinata</h3>
        <p className={`text-[11px] font-black uppercase tracking-[0.4em] mt-3 italic relative z-10 ${
          isDark ? "text-slate-600" : "text-slate-400"
        }`}>
          Hoteli nisu pronadjeni na Google-u.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[40px] md:rounded-[55px] overflow-hidden relative">
      <div ref={mapContainer} className="h-[450px] md:h-[600px] w-full" />

      {/* Selected hotel popup */}
      {selectedHotel && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="glass-card rounded-[20px] p-4 flex items-center gap-4 max-w-sm">
            <button
              onClick={() => setSelectedHotel(null)}
              className={`absolute top-2 right-2 transition-colors ${
                isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <X size={16} />
            </button>
            <div className={`w-14 h-14 rounded-[16px] flex flex-col items-center justify-center font-black italic flex-shrink-0 border ${
              selectedHotel.aiScore >= 8
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : selectedHotel.aiScore >= 6
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-rose-500/20 border-rose-500/40 text-rose-400"
            }`}>
              <span className="text-[6px] uppercase not-italic opacity-60 font-black">AI</span>
              <span className="text-lg leading-none tracking-tighter">{selectedHotel.aiScore.toFixed(1)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-black italic uppercase truncate ${
                isDark ? "text-white" : "text-slate-900"
              }`}>{selectedHotel.hotelName}</h4>
              <div className="flex items-center gap-2 mt-1">
                {selectedHotel.googleRating && (
                  <span className="text-xs flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" className="text-amber-400" />
                    <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {selectedHotel.googleRating.toFixed(1)}
                    </span>
                  </span>
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}>{selectedHotel.location}</span>
              </div>
            </div>
            <button
              onClick={() => onHotelClick(selectedHotel)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-[12px] text-[11px] font-black uppercase tracking-widest flex-shrink-0 btn-glow transition-all"
            >
              Analiza
            </button>
          </div>
        </div>
      )}

      {/* Hotel strip at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 ${
        isDark ? "bg-gradient-to-t from-[#020205] to-transparent" : "bg-gradient-to-t from-white to-transparent"
      }`}>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {withCoords.map((r, i) => {
            const color =
              r.aiScore >= 8
                ? isDark ? "border-emerald-500/40 bg-emerald-500/10" : "border-emerald-500/30 bg-emerald-50"
                : r.aiScore >= 6
                  ? isDark ? "border-amber-500/40 bg-amber-500/10" : "border-amber-500/30 bg-amber-50"
                  : isDark ? "border-rose-500/40 bg-rose-500/10" : "border-rose-500/30 bg-rose-50";
            const isSelected = selectedHotel?.hotelName === r.hotelName;
            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedHotel(r);
                  if (mapRef.current && r.longitude && r.latitude) {
                    mapRef.current.flyTo({ center: [r.longitude, r.latitude], zoom: 15 });
                  }
                }}
                className={`flex-shrink-0 glass-card ${color} rounded-[16px] px-4 py-3 text-left min-w-[200px] transition-all ${
                  isSelected ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                <div className={`text-sm font-black italic uppercase truncate ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {r.hotelName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black italic text-indigo-500">
                    AI {r.aiScore.toFixed(1)}
                  </span>
                  {r.googleRating && (
                    <span className={`text-xs flex items-center gap-0.5 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}>
                      <Star size={10} fill="currentColor" className="text-amber-400" />
                      {r.googleRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MAIN PAGE — Search Results
   ============================================ */
export default function SearchPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeFilter, setActiveFilter] = useState("Svi");
  const [fromCache, setFromCache] = useState(false);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
      setLoading(true);
      setError("");
      setResults(null);
      setFromCache(false);

      try {
        const { data, fromCache: cached } = await fetchSearch(searchQuery);
        setResults(data as SearchResponse);
        setFromCache(cached);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Doslo je do greske");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(query);
  };

  const handleHotelClick = (result: SearchResult) => {
    const params = new URLSearchParams({
      name: result.hotelName,
      location: result.location,
    });
    if (result.googlePlaceId) {
      params.set("placeId", result.googlePlaceId);
    }
    router.push(`/hotel/detail?${params.toString()}`);
  };

  // Filter results based on active filter
  const getFilteredResults = (allResults: SearchResult[]) => {
    const sorted = [...allResults].sort((a, b) => b.aiScore - a.aiScore);
    switch (activeFilter) {
      case "AI 8+":
        return sorted.filter((r) => r.aiScore >= 8);
      case "Google 4.5+":
        return sorted.filter((r) => r.googleRating && r.googleRating >= 4.5);
      case "Verifikovani":
        return sorted.filter((r) => r.verified);
      default:
        return sorted;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-700 overflow-x-hidden ${
        isDark ? "bg-[#020205] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Ambient Lights */}
      <div
        className={`fixed top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${
          isDark ? "bg-indigo-600/5 opacity-100" : "bg-indigo-500/10 opacity-40"
        }`}
      />
      <div
        className={`fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${
          isDark ? "bg-purple-600/5 opacity-100" : "bg-purple-500/10 opacity-40"
        }`}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-32 relative z-10">
        {/* Page Header */}
        <PageHeader label="Istrazi" backHref="/dashboard" />

        {/* Search Bar */}
        <div className="mb-8 md:mb-12">
          <div className={`glass-card rounded-[32px] md:rounded-[40px] p-2 md:p-3 flex items-center gap-3 transition-all focus-within:border-indigo-500/50 ${
            isDark ? "" : ""
          }`}>
            <div className={`ml-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Hotel, destinacija, agencija..."
              className={`input-glass bg-transparent flex-1 h-10 md:h-12 outline-none text-base md:text-lg font-semibold border-none shadow-none focus:border-none focus:ring-0 ${
                isDark
                  ? "text-white placeholder:text-slate-700"
                  : "text-slate-900 placeholder:text-slate-400"
              }`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-[20px] md:rounded-[24px] font-black text-xs md:text-[11px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 btn-glow border border-white/10"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>AI Pretraga</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scanning */}
        {loading && <ScanningScreen query={query} isDark={isDark} />}

        {/* Error */}
        {error && (
          <div className="text-center pt-16 animate-fade-in">
            <div className={`glass-card rounded-[35px] p-8 max-w-md mx-auto ${
              isDark
                ? "border-rose-500/20 bg-rose-500/5"
                : "border-rose-300/30 bg-rose-50"
            }`}>
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-rose-400" />
              </div>
              <p className={`font-semibold mb-4 ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                {error}
              </p>
              <button
                onClick={() => handleSearch(query)}
                className="text-indigo-500 text-xs font-black uppercase tracking-widest italic hover:underline decoration-2 underline-offset-4 transition-all"
              >
                Pokusaj ponovo
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div className="text-center pt-16 animate-fade-in">
            {/* Fingerprint icon with pulse */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full pulse-ring" />
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-white text-indigo-600 shadow-xl"
              }`}>
                <Fingerprint size={48} strokeWidth={1.5} />
              </div>
            </div>

            <h2 className="text-gradient text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-4">
              Pokreni AI skeniranje
            </h2>
            <p className={`text-sm font-medium leading-relaxed max-w-sm mx-auto mb-10 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}>
              Unesi naziv hotela, destinacije ili agencije i pritisni Enter. AI
              ce analizirati sve dostupne recenzije.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Hanioti hoteli",
                "Santorini apartmani",
                "Budva smestaj",
                "Lefkada vile",
                "Thassos all inclusive",
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  className={`glass-card rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all bento-hover ${
                    isDark
                      ? "text-slate-500 hover:text-white hover:border-indigo-500/40"
                      : "text-slate-400 hover:text-slate-900 hover:border-indigo-300/40"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="animate-fade-in-up">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-1">
              <div>
                <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] italic leading-none mb-2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}>
                  Istraga zavrsena
                </h2>
                <h1 className="text-gradient text-2xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                  {results.destination}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-xs md:text-sm font-semibold italic ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Pronadjeno <span className="text-indigo-500 font-black">{results.results.length}</span> objekata
                  {fromCache && (
                    <span className="ml-2 text-amber-400">/ Offline kes</span>
                  )}
                </p>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isDark
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 border-indigo-100 text-indigo-600"
                }`}>
                  <Sparkles size={12} />
                  <span className="text-[11px] font-black uppercase tracking-widest italic">Verifikovano</span>
                </div>
              </div>
            </div>

            {/* View Toggle & Filter Chips */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="glass-card p-1 rounded-[20px] flex w-fit">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <List size={14} /> Lista
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all ${
                    viewMode === "map"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <MapIcon size={14} /> Mapa
                </button>
              </div>

              {/* Horizontal scrolling filter chips */}
              <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 pb-2">
                {["Svi", "AI 8+", "Google 4.5+", "Verifikovani"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`whitespace-nowrap px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeFilter === f
                        ? isDark
                          ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400 shadow-xl shadow-indigo-500/10"
                          : "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                        : isDark
                          ? "border-white/5 text-slate-600 hover:text-slate-400"
                          : "border-black/5 bg-white text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Summary Card */}
            <div className={`glass-card p-6 md:p-8 rounded-[35px] md:rounded-[45px] mb-10 flex flex-col md:flex-row gap-6 items-center ${
              isDark
                ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                : "border-emerald-300/30 bg-emerald-50/50"
            }`}>
              <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0 animate-pulse ${
                isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
              }`}>
                <Sparkles size={32} />
              </div>
              <div>
                <h4 className={`text-[11px] font-black uppercase tracking-widest italic mb-2 ${
                  isDark ? "text-emerald-400" : "text-emerald-600"
                }`}>
                  AI Instant Insight
                </h4>
                <p className={`text-sm md:text-base font-medium leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  {results.summary}
                </p>
              </div>
            </div>

            {/* View Modes */}
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12">
                {getFilteredResults(results.results).map((result, i) => (
                  <ResultCard
                    key={i}
                    result={result}
                    onClick={() => handleHotelClick(result)}
                    isDark={isDark}
                  />
                ))}
                {getFilteredResults(results.results).length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <Filter size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                    <p className={`text-sm font-bold uppercase tracking-widest italic ${
                      isDark ? "text-slate-600" : "text-slate-400"
                    }`}>
                      Nema rezultata za ovaj filter
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-12">
                <MapView
                  results={results.results}
                  onHotelClick={handleHotelClick}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        )}

        {/* Footer Signature */}
        <FooterSignature />
      </main>
    </div>
  );
}
