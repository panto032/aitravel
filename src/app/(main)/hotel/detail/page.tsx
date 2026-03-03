"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronLeft, MapPin, Star, ShieldCheck, Zap, ArrowUpDown, ArrowRight,
  Sparkles, ShieldAlert, Fingerprint, Waves, Wifi, Coffee, Bed,
  Utensils, ThermometerSun, Heart, TrendingUp, TrendingDown, Minus,
  ThumbsUp, ThumbsDown, Image as ImageIcon, Globe,
} from "lucide-react";
import type { HotelAnalysis } from "@/lib/ai";
import { fetchAnalysis } from "@/lib/api-client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const categoryIcons: Record<string, React.ReactNode> = {
  "Lokacija": <Waves className="text-emerald-400" size={24} />,
  "Čistoća": <Sparkles className="text-blue-400" size={24} />,
  "Cistoca": <Sparkles className="text-blue-400" size={24} />,
  "Osoblje": <ShieldCheck className="text-indigo-400" size={24} />,
  "Kreveti i sobe": <Bed className="text-purple-400" size={24} />,
  "Doručak": <Coffee className="text-amber-400" size={24} />,
  "Dorucak": <Coffee className="text-amber-400" size={24} />,
  "WiFi": <Wifi className="text-rose-500" size={24} />,
  "Vrednost za novac": <Zap className="text-emerald-400" size={24} />,
};

const trendIcons: Record<string, React.ReactNode> = {
  improving: <TrendingUp size={14} className="text-emerald-400" />,
  declining: <TrendingDown size={14} className="text-rose-400" />,
  stable: <Minus size={14} className="text-slate-500" />,
};

interface FeedbackState {
  [key: string]: boolean | undefined; // category → isCorrect
}

function ScanningLoader({ name, step }: { name: string; step: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="relative w-48 h-48 mb-12 animate-float">
        <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite]" />
        <div className="absolute inset-8 border border-emerald-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-indigo-500/10 overflow-hidden relative glass-card">
            <div className="scanning-line absolute h-[3px] w-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px]" />
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Fingerprint size={48} className="text-indigo-400 opacity-60" />
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
        Analiziram {name}
      </h2>
      <p className="text-sm text-indigo-400 font-black uppercase tracking-[0.3em] opacity-80">
        {step}
      </p>
    </div>
  );
}

function PhotoGallery({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-[28px] overflow-hidden">
        {photos.slice(0, 6).map((url, i) => (
          <div
            key={i}
            className={`relative overflow-hidden bg-slate-900 ${
              i === 0 ? "col-span-2 row-span-2 h-64 md:h-80" : "h-32 md:h-40"
            }`}
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
      {photos.length > 6 && (
        <p className="text-[10px] text-slate-600 text-center mt-2 font-bold">
          + {photos.length - 6} više slika
        </p>
      )}
    </div>
  );
}

function MiniMap({
  lat,
  lng,
  hotelName,
  nearby,
}: {
  lat: number;
  lng: number;
  hotelName: string;
  nearby: HotelAnalysis["nearby"];
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [lng, lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Hotel marker (larger, indigo)
    const hotelEl = document.createElement("div");
    hotelEl.style.cssText = "width:40px;height:40px;border-radius:50%;background:#6366f1;border:3px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(99,102,241,0.5);";
    hotelEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 22V11l9-7 9 7v11"/><path d="M9 22V12h6v10"/></svg>';

    new maplibregl.Marker({ element: hotelEl })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<strong style="color:#1a1a2e">${hotelName}</strong>`))
      .addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [lat, lng, hotelName, nearby]);

  return (
    <div className="glass-card rounded-[28px] overflow-hidden mb-12">
      <div ref={mapContainer} className="h-[220px] w-full" />
    </div>
  );
}

function HotelDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<HotelAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Čitam recenzije...");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null);

  const hotelName = searchParams.get("name") || "";
  const location = searchParams.get("location") || "";
  const googlePlaceId = searchParams.get("placeId") || undefined;

  const loadAnalysis = useCallback(async () => {
    if (!hotelName || !location) return;
    setLoading(true);
    setError("");

    // Multi-step loading messages
    const steps = [
      "Tražim na Google-u...",
      "Čitam recenzije...",
      "AI analiza u toku...",
      "Pripremam izveštaj...",
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setLoadingStep(steps[stepIdx]);
    }, 2500);

    try {
      const result = await fetchAnalysis(hotelName, location, googlePlaceId);
      setAnalysis(result.data as HotelAnalysis);
      setFromCache(result.fromCache);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri analizi");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }, [hotelName, location, googlePlaceId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const handleSave = async () => {
    if (!analysis || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName: analysis.hotelName,
          location: analysis.location,
          aiScore: analysis.aiScore,
          analysis,
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleFeedback = async (category: string, isCorrect: boolean) => {
    if (feedbackSending) return;
    setFeedbackSending(category);
    try {
      // We need hotelCacheId — use a simple lookup
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelCacheId: analysis?.googlePlaceId || `${hotelName}:${location}`,
          category,
          isCorrect,
        }),
      });
      if (res.ok) {
        setFeedback((prev) => ({ ...prev, [category]: isCorrect }));
      }
    } catch {
      /* ignore */
    } finally {
      setFeedbackSending(null);
    }
  };

  if (loading) return <ScanningLoader name={hotelName} step={loadingStep} />;

  if (error || !analysis) {
    return (
      <div className="text-center pt-32">
        <div className="glass-card border-rose-500/20 bg-rose-500/5 rounded-[35px] p-8 max-w-md mx-auto">
          <p className="text-rose-400 font-semibold mb-4">
            {error || "Nema podataka"}
          </p>
          <button
            onClick={loadAnalysis}
            className="text-indigo-400 text-sm font-black uppercase tracking-widest"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  const worstCategory = [...analysis.scores].sort(
    (a, b) => a.score - b.score
  )[0];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={`glass-card px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              saved
                ? "border-rose-500/30 text-rose-400"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {saved ? "Sačuvano" : "Sačuvaj"}
            </span>
          </button>
          <div className="glass-card px-5 py-2 rounded-full border-indigo-500/30 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300">
              {analysis.dataQuality === "full"
                ? "Verifikovan Izveštaj"
                : analysis.dataQuality === "partial"
                  ? "Delimično Verifikovan"
                  : "AI Procena"}
            </span>
          </div>
          {fromCache && (
            <div className="glass-card px-4 py-2 rounded-full border-amber-500/30 bg-amber-500/10 flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
                Offline keš
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      {analysis.photos && analysis.photos.length > 0 && (
        <PhotoGallery photos={analysis.photos} />
      )}

      {/* Title + Score */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none text-gradient mb-4">
            {analysis.hotelName}
          </h1>
          <p className="text-slate-500 text-sm font-bold flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-indigo-500" />
            {analysis.location} • {analysis.priceRange}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {analysis.summary}
          </p>

          {/* AI Trust Rating Card */}
          <div className="glass-card p-8 rounded-[40px] relative overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">
                  AI Trust Rating
                </span>
                <div className="text-7xl font-black italic text-white leading-none">
                  {analysis.aiScore.toFixed(1)}
                </div>
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={
                        i <= Math.round(analysis.aiScore / 2)
                          ? "#6366f1"
                          : "transparent"
                      }
                      className={
                        i <= Math.round(analysis.aiScore / 2)
                          ? "text-indigo-500"
                          : "text-slate-800"
                      }
                    />
                  ))}
                </div>
                {/* Feedback on overall */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleFeedback("overall", true)}
                    className={`p-1.5 rounded-lg transition-all ${
                      feedback["overall"] === true
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "hover:bg-white/5 text-slate-600"
                    }`}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback("overall", false)}
                    className={`p-1.5 rounded-lg transition-all ${
                      feedback["overall"] === false
                        ? "bg-rose-500/20 text-rose-400"
                        : "hover:bg-white/5 text-slate-600"
                    }`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 md:min-w-[180px]">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">
                  Izvor podataka
                </span>
                <div className="text-lg font-bold text-white">
                  {analysis.totalReviews.toLocaleString("sr-RS")} recenzija
                </div>
                {analysis.googleRating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-white text-sm font-bold">
                      {analysis.googleRating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-600">Google</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysis.reviewSources.map((src) => (
                    <span
                      key={src}
                      className="text-[9px] text-slate-600 font-bold uppercase bg-white/5 px-2 py-0.5 rounded"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
          <div className="glass-card p-8 rounded-[35px] flex flex-col items-center justify-center text-center">
            <ShieldCheck className="text-emerald-400 mb-3" size={32} />
            <span className="text-xs font-black text-emerald-400">
              {analysis.aiScore >= 7 ? "SIGURNO" : "RIZIČNO"}
            </span>
          </div>
          <div className="glass-card p-8 rounded-[35px] flex flex-col items-center justify-center text-center">
            <Zap className="text-indigo-400 mb-3" size={32} />
            <span className="text-xs font-black text-indigo-400">
              {analysis.bestFor[0]?.toUpperCase() || "SOLIDAN"}
            </span>
          </div>

          {/* Data quality badge */}
          <div className="glass-card p-4 rounded-[35px] col-span-2 flex items-center gap-4">
            {analysis.verified ? (
              <>
                <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Google Verifikovano
                  </div>
                  <div className="text-xs text-slate-500">
                    {analysis.googleReviewCount?.toLocaleString("sr-RS")} pravih recenzija
                  </div>
                </div>
              </>
            ) : (
              <>
                <ImageIcon size={20} className="text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    AI Procena
                  </div>
                  <div className="text-xs text-slate-500">
                    Bez Google verifikacije
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Language breakdown */}
      {analysis.languageBreakdown && analysis.languageBreakdown.length > 0 && (
        <div className="glass-card p-5 rounded-[28px] mb-8 flex items-center gap-4 overflow-x-auto hide-scrollbar">
          <Globe size={18} className="text-indigo-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex-shrink-0">
            Analizirano:
          </span>
          <div className="flex gap-3">
            {analysis.languageBreakdown.map((lang) => (
              <span
                key={lang.language}
                className="text-sm text-slate-300 font-medium whitespace-nowrap"
              >
                {lang.flag} {lang.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bento Insights Grid */}
      <h2 className="text-xl font-black italic tracking-tighter mb-6 flex items-center gap-3">
        <Sparkles size={20} className="text-indigo-500" /> Detaljna AI Analiza
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {analysis.scores.map((s) => (
          <div
            key={s.category}
            className="glass-card p-6 rounded-[35px] hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              {categoryIcons[s.category] || (
                <ThermometerSun className="text-slate-400" size={24} />
              )}
              {s.trend && (
                <div className="flex items-center gap-1">
                  {trendIcons[s.trend]}
                  <span className="text-[9px] text-slate-600 font-bold uppercase">
                    {s.trend === "improving"
                      ? "Raste"
                      : s.trend === "declining"
                        ? "Pada"
                        : "Stabilno"}
                  </span>
                </div>
              )}
            </div>
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">
              {s.category}
            </h4>
            <div
              className={`text-3xl font-black italic mb-3 ${
                s.score >= 8
                  ? "text-emerald-400"
                  : s.score >= 6
                    ? "text-white"
                    : s.score >= 4
                      ? "text-amber-400"
                      : "text-rose-500"
              }`}
            >
              {s.score.toFixed(1)}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              &quot;{s.detail}&quot;
            </p>

            {/* Sample quote from real reviews */}
            {s.sampleQuote && (
              <div className="mt-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 italic">
                  &quot;{s.sampleQuote}&quot;
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-slate-600 font-bold">
                Pomenuto u {s.mentionCount} recenzija
              </p>
              {/* Per-category feedback */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleFeedback(s.category, true)}
                  className={`p-1 rounded transition-all ${
                    feedback[s.category] === true
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-700 hover:text-slate-400"
                  }`}
                >
                  <ThumbsUp size={10} />
                </button>
                <button
                  onClick={() => handleFeedback(s.category, false)}
                  className={`p-1 rounded transition-all ${
                    feedback[s.category] === false
                      ? "bg-rose-500/20 text-rose-400"
                      : "text-slate-700 hover:text-slate-400"
                  }`}
                >
                  <ThumbsDown size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* AI Secret Tip */}
        <div className="glass-card p-8 rounded-[40px] md:col-span-2 lg:col-span-1 border-indigo-500/20 shadow-xl bg-indigo-500/[0.03]">
          <div className="flex items-start gap-4">
            <Sparkles className="text-indigo-400 flex-shrink-0" size={28} />
            <div>
              <h4 className="text-xs font-black uppercase mb-2 text-indigo-400">
                Glavna AI Tajna
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-semibold italic">
                {analysis.aiTip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card p-6 rounded-[35px] border-emerald-500/10 bg-emerald-500/[0.02]">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">
            Prednosti
          </h3>
          {analysis.pros.map((pro, i) => (
            <div key={i} className="flex items-start gap-3 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-slate-300 font-medium">{pro}</p>
            </div>
          ))}
        </div>
        <div className="glass-card p-6 rounded-[35px] border-rose-500/10 bg-rose-500/[0.02]">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-4">
            Mane
          </h3>
          {analysis.cons.map((con, i) => (
            <div key={i} className="flex items-start gap-3 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-slate-300 font-medium">{con}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Recommendations */}
      {analysis.nearby.length > 0 && (
        <>
          <h2 className="text-xl font-black italic tracking-tighter mb-6 flex items-center gap-3">
            <MapPin size={20} className="text-indigo-500" /> Preporuke u blizini
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {analysis.nearby.map((place, i) => {
              const typeIcon = {
                restaurant: (
                  <Utensils size={20} className="text-rose-400" />
                ),
                beach: <Waves size={20} className="text-blue-400" />,
                bar: <Coffee size={20} className="text-purple-400" />,
                attraction: <Star size={20} className="text-amber-400" />,
              };
              return (
                <div
                  key={i}
                  className="glass-card p-5 rounded-[30px] flex items-center gap-4 hover:bg-white/5 transition-all"
                >
                  {place.photoUrl ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      {typeIcon[place.type] || (
                        <MapPin size={20} className="text-slate-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {place.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {place.crossRef || place.detail}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-indigo-400 text-sm font-black">
                      {place.distance}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      ★ {place.rating}
                      {place.reviewCount
                        ? ` (${place.reviewCount})`
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Mini Map */}
      {analysis.latitude && analysis.longitude && (
        <MiniMap
          lat={analysis.latitude}
          lng={analysis.longitude}
          hotelName={analysis.hotelName}
          nearby={analysis.nearby}
        />
      )}

      {/* Critical Warning */}
      {worstCategory && worstCategory.score < 5 && (
        <div className="glass-card p-8 rounded-[40px] mb-12 border-rose-500/30 bg-rose-500/[0.03] shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <ShieldAlert className="text-rose-500" size={28} />
            <span className="text-sm font-black text-rose-500 uppercase tracking-widest">
              Kritično Upozorenje
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            <strong>{worstCategory.category}</strong> je najslabija tačka sa
            ocenom{" "}
            <strong className="text-rose-400">
              {worstCategory.score.toFixed(1)}
            </strong>
            . {worstCategory.detail}
          </p>
        </div>
      )}

      {/* Best For Tags */}
      <div className="flex flex-wrap gap-3 mb-20">
        {analysis.bestFor.map((tag) => (
          <span
            key={tag}
            className="glass-card px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest text-indigo-400 border-indigo-500/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HotelDetailPage() {
  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
      <div className="max-w-5xl mx-auto w-full">
        <Suspense
          fallback={
            <div className="flex items-center justify-center pt-32">
              <Fingerprint
                size={48}
                className="text-indigo-500/30 animate-pulse"
              />
            </div>
          }
        >
          <HotelDetailContent />
        </Suspense>
      </div>
    </main>
  );
}
