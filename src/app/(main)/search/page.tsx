"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ChevronLeft, Sparkles, Fingerprint, MapPin, Star,
  ShieldCheck, List, Map as MapIcon, Loader2, X,
} from "lucide-react";
import type { SearchResponse, SearchResult } from "@/lib/ai";
import { fetchSearch } from "@/lib/api-client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function ScanningScreen({ query }: { query: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Pitam AI agenta...",
    "Pretražujem Google Places...",
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
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-16 animate-float">
        <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite]" />
        <div className="absolute inset-12 border border-emerald-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border border-indigo-500/10 overflow-hidden relative glass-card shadow-2xl">
            <div className="scanning-line absolute h-[3px] w-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px]" />
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Fingerprint size={64} className="text-indigo-400 opacity-60" />
              <div className="text-[10px] font-black text-indigo-500 tracking-[0.4em] uppercase">
                Deep Scanning
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
        Analiziram &quot;{query}&quot;...
      </h2>
      <p className="text-sm text-indigo-400 font-black uppercase tracking-[0.3em] opacity-80 mb-4">
        {steps[step] || steps[0]}
      </p>
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i <= step ? "bg-indigo-500" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  const scoreColor =
    result.aiScore >= 8
      ? "bg-emerald-500"
      : result.aiScore >= 6
        ? "bg-amber-500"
        : "bg-rose-500";

  const scoreBorder =
    result.aiScore >= 8
      ? "border-emerald-500/40"
      : result.aiScore >= 6
        ? "border-amber-500/40"
        : "border-rose-500/40";

  // Use Google photo or fallback to Unsplash
  const imageUrl =
    result.photoUrl ||
    `https://source.unsplash.com/600x400/?${encodeURIComponent(
      `${result.location} hotel resort`
    )}`;

  return (
    <div
      className="glass-card rounded-[32px] border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col overflow-hidden h-full"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={result.hotelName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent" />

        {/* AI Score badge */}
        <div
          className={`absolute top-4 left-4 glass-card ${scoreBorder} rounded-2xl px-3 py-2 flex flex-col items-center`}
        >
          <span className="text-[8px] text-slate-400 font-black uppercase">
            AI
          </span>
          <span className="text-lg font-black italic text-white leading-none">
            {result.aiScore.toFixed(1)}
          </span>
        </div>

        {/* Google Rating badge */}
        {result.googleRating && (
          <div className="absolute top-4 left-20 glass-card rounded-2xl px-3 py-2 flex items-center gap-1">
            <Star size={12} className="text-amber-400" fill="currentColor" />
            <span className="text-sm font-bold text-white">
              {result.googleRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price badge */}
        {result.priceRange && result.priceRange !== "N/A" && (
          <div className="absolute top-4 right-4 glass-card rounded-2xl px-3 py-2 text-right">
            <div className="text-base font-black text-white leading-none">
              {result.priceRange}
            </div>
            <div className="text-[8px] text-slate-400 font-bold">po noći</div>
          </div>
        )}

        {/* Location pill */}
        {result.distance && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <MapPin size={10} className="text-indigo-400" />
            <span className="text-[10px] text-white font-bold">
              {result.distance}
            </span>
          </div>
        )}

        {/* Verified badge */}
        {result.verified && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm rounded-full px-2.5 py-1">
            <ShieldCheck size={10} className="text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-bold">
              Verifikovano
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold mb-0.5 group-hover:text-indigo-400 transition-colors">
            {result.hotelName}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
            {result.location}
          </p>
          {result.googleReviewCount && (
            <p className="text-[10px] text-slate-600 mb-3">
              {result.googleReviewCount.toLocaleString("sr-RS")} recenzija
            </p>
          )}
          <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
            {result.shortSummary}
          </p>
        </div>

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {result.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${scoreColor} rounded-full`}
            style={{ width: `${result.aiScore * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MapView({
  results,
  onHotelClick,
}: {
  results: SearchResult[];
  onHotelClick: (r: SearchResult) => void;
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
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
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
      <div className="glass-card rounded-[28px] p-12 text-center">
        <MapIcon size={48} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 text-sm">
          Nema koordinata za mapu. Hoteli nisu pronađeni na Google-u.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[28px] overflow-hidden relative">
      <div ref={mapContainer} className="h-[500px] w-full" />

      {/* Selected hotel popup */}
      {selectedHotel && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 max-w-sm">
            <button
              onClick={() => setSelectedHotel(null)}
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 italic flex-shrink-0">
              {selectedHotel.aiScore.toFixed(1)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{selectedHotel.hotelName}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                {selectedHotel.googleRating && (
                  <span className="text-xs text-slate-400 flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" className="text-amber-400" />
                    {selectedHotel.googleRating.toFixed(1)}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">{selectedHotel.location}</span>
              </div>
            </div>
            <button
              onClick={() => onHotelClick(selectedHotel)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
            >
              Analiza
            </button>
          </div>
        </div>
      )}

      {/* Hotel strip at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#020205] to-transparent">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {withCoords.map((r, i) => {
            const color =
              r.aiScore >= 8
                ? "border-emerald-500/40 bg-emerald-500/10"
                : r.aiScore >= 6
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-rose-500/40 bg-rose-500/10";
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
                className={`flex-shrink-0 glass-card ${color} rounded-2xl px-4 py-3 text-left min-w-[200px] transition-all ${isSelected ? "ring-2 ring-indigo-500" : ""}`}
              >
                <div className="text-sm font-bold text-white truncate">
                  {r.hotelName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-indigo-400">
                    AI {r.aiScore.toFixed(1)}
                  </span>
                  {r.googleRating && (
                    <span className="text-xs text-slate-500 flex items-center gap-0.5">
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

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
        setError(err instanceof Error ? err.message : "Došlo je do greške");
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

  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
      <div className="max-w-5xl mx-auto w-full">
        {/* Search Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="relative flex-1">
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-3 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
              <Search size={20} className="ml-2 text-slate-500" />
              <input
                type="text"
                placeholder="Hotel, destinacija, agencija..."
                className="bg-transparent flex-1 h-10 outline-none text-base font-semibold text-white placeholder:text-slate-700"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "AI"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scanning */}
        {loading && <ScanningScreen query={query} />}

        {/* Error */}
        {error && (
          <div className="text-center pt-16 animate-fade-in">
            <div className="glass-card border-rose-500/20 bg-rose-500/5 rounded-[35px] p-8 max-w-md mx-auto">
              <p className="text-rose-400 font-semibold mb-4">{error}</p>
              <button
                onClick={() => handleSearch(query)}
                className="text-indigo-400 text-sm font-black uppercase tracking-widest"
              >
                Pokušaj ponovo
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div className="text-center pt-16 animate-fade-in">
            <Fingerprint
              size={64}
              className="text-indigo-500/30 mx-auto mb-6"
            />
            <h2 className="text-2xl font-black italic tracking-tighter text-white mb-3">
              Pokreni AI skeniranje
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-10">
              Unesi naziv hotela, destinacije ili agencije i pritisni Enter. AI
              će analizirati sve dostupne recenzije.
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
                  className="glass-card rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-indigo-500/40 transition-all"
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter">
                  Rezultati za &quot;{results.destination}&quot;
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Pronađeno {results.results.length} objekata • AI +
                  Google Filtrirano
                  {fromCache && (
                    <span className="ml-2 text-amber-400">• Offline keš</span>
                  )}
                </p>
              </div>

              {/* View toggle */}
              <div className="flex glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-all ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2.5 transition-all ${
                    viewMode === "map"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <MapIcon size={18} />
                </button>
              </div>
            </div>

            {/* AI Summary */}
            <div className="glass-card p-6 rounded-[35px] border-emerald-500/20 bg-emerald-500/[0.02] mb-10 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-[22px] flex items-center justify-center text-emerald-400 flex-shrink-0 animate-pulse">
                <Sparkles size={32} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-emerald-400">
                  AI Instant Insight
                </h4>
                <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
                  {results.summary}
                </p>
              </div>
            </div>

            {/* View Modes */}
            {viewMode === "list" ? (
              <>
                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar mb-4">
                  {[
                    "AI Preporuka",
                    "Najbolja lokacija",
                    "Mirne sobe",
                    "Super doručak",
                    "Novi nameštaj",
                  ].map((f, i) => (
                    <button
                      key={i}
                      className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                        i === 0
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                          : "glass-card border-white/5 text-slate-500 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Result Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.results
                    .sort((a, b) => b.aiScore - a.aiScore)
                    .map((result, i) => (
                      <ResultCard
                        key={i}
                        result={result}
                        onClick={() => handleHotelClick(result)}
                      />
                    ))}
                </div>
              </>
            ) : (
              <MapView
                results={results.results}
                onHotelClick={handleHotelClick}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
