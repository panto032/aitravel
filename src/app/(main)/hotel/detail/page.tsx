"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin, Star, ShieldCheck, Zap, Sparkles, ShieldAlert,
  Fingerprint, Waves, Wifi, Coffee, Bed, Utensils, ThermometerSun,
  Heart, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown,
  Image as ImageIcon, Globe, RefreshCw, Check, X, AlertTriangle,
  Lightbulb, BarChart3,
} from "lucide-react";
import type { HotelAnalysis } from "@/lib/ai";
import { fetchAnalysis } from "@/lib/api-client";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const categoryIcons: Record<string, React.ReactNode> = {
  "Lokacija": <MapPin size={20} />,
  "Cistoca": <Sparkles size={20} />,
  "Čistoća": <Sparkles size={20} />,
  "Osoblje": <ShieldCheck size={20} />,
  "Kreveti i sobe": <Bed size={20} />,
  "Doručak": <Coffee size={20} />,
  "Dorucak": <Coffee size={20} />,
  "WiFi": <Wifi size={20} />,
  "Vrednost za novac": <Zap size={20} />,
};

const trendIcons: Record<string, React.ReactNode> = {
  improving: <TrendingUp size={12} className="text-emerald-500" />,
  declining: <TrendingDown size={12} className="text-rose-500" />,
  stable: <Minus size={12} className="text-slate-500" />,
};

interface FeedbackState {
  [key: string]: boolean | undefined;
}

/* ─── Scanning Loader ─── */
function ScanningLoader({ name, step, isDark }: { name: string; step: string; isDark: boolean }) {
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
      <h2 className={`text-2xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
        Analiziram {name}
      </h2>
      <p className="text-sm text-indigo-400 font-black uppercase tracking-[0.3em] opacity-80">
        {step}
      </p>
    </div>
  );
}

/* ─── Matrix Card ─── */
function MatrixCard({
  icon,
  name,
  score,
  trend,
  isDark,
  sampleQuote,
  mentionCount,
  detail,
  onFeedback,
  feedbackValue,
}: {
  icon: React.ReactNode;
  name: string;
  score: number;
  trend?: "improving" | "stable" | "declining";
  isDark: boolean;
  sampleQuote?: string;
  mentionCount: number;
  detail: string;
  onFeedback: (isCorrect: boolean) => void;
  feedbackValue?: boolean;
}) {
  const scoreColor =
    score >= 8.5 ? "text-emerald-500" : score >= 7 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center bento-hover border-white/5">
      <div className="text-slate-500 mb-4">{icon}</div>
      <span className="text-[11px] font-black uppercase text-slate-500 mb-3 italic tracking-widest">{name}</span>
      <div className={`text-3xl font-black italic leading-none ${scoreColor} tracking-tighter`}>
        {score.toFixed(1)}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-4">
          {trendIcons[trend]}
          <span className="text-[11px] font-black uppercase text-slate-600 italic">
            {trend === "improving" ? "Raste" : trend === "declining" ? "Pada" : "Stabilno"}
          </span>
        </div>
      )}
      <p className={`text-xs italic leading-relaxed mt-3 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
        &quot;{detail}&quot;
      </p>
      {sampleQuote && (
        <div className={`mt-3 p-3 rounded-xl border w-full text-left ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-100 border-slate-200"}`}>
          <p className={`text-xs italic ${isDark ? "text-slate-500" : "text-slate-600"}`}>
            &quot;{sampleQuote}&quot;
          </p>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 w-full">
        <p className="text-xs text-slate-600 font-bold">
          {mentionCount} recenzija
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => onFeedback(true)}
            className={`p-1 rounded transition-all ${
              feedbackValue === true
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-700 hover:text-slate-400"
            }`}
          >
            <ThumbsUp size={10} />
          </button>
          <button
            onClick={() => onFeedback(false)}
            className={`p-1 rounded transition-all ${
              feedbackValue === false
                ? "bg-rose-500/20 text-rose-400"
                : "text-slate-700 hover:text-slate-400"
            }`}
          >
            <ThumbsDown size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Report Card (Forensic Conclusions) ─── */
function ReportCard({
  type,
  title,
  text,
  isDark,
}: {
  type: "pos" | "neg" | "alert";
  title: string;
  text: string;
  isDark: boolean;
}) {
  const colors = {
    pos: "border-emerald-500/40 text-emerald-500 bg-emerald-500/5",
    neg: "border-rose-500/40 text-rose-500 bg-rose-500/5",
    alert: "border-amber-500/40 text-amber-500 bg-amber-500/5",
  };
  return (
    <div className={`p-7 rounded-[35px] border-2 ${colors[type]} glass-card shadow-2xl bento-hover`}>
      <div className="flex items-center gap-3 mb-4">
        {type === "pos" ? (
          <Check size={16} strokeWidth={4} />
        ) : type === "neg" ? (
          <X size={16} strokeWidth={4} />
        ) : (
          <AlertTriangle size={16} strokeWidth={4} />
        )}
        <span className="text-xs font-black uppercase tracking-widest italic">{title}</span>
      </div>
      <p className={`text-sm md:text-base font-semibold italic leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
        &quot;{text}&quot;
      </p>
    </div>
  );
}

/* ─── Market Bar (Country Audit) ─── */
function MarketBar({
  flag,
  name,
  val,
  isDark,
}: {
  flag: string;
  name: string;
  val: number;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-5">
      <span className="text-2xl leading-none drop-shadow-lg">{flag}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-2 leading-none">
          <span className={`text-xs font-black uppercase italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {name}
          </span>
          <span className="text-xs font-black text-indigo-500">{val}%</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden shadow-inner ${isDark ? "bg-white/5" : "bg-slate-200"}`}>
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_10px_#6366f1]"
            style={{ width: `${val}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── MiniMap ─── */
function MiniMap({
  lat,
  lng,
  hotelName,
  nearby,
  isDark,
}: {
  lat: number;
  lng: number;
  hotelName: string;
  nearby: HotelAnalysis["nearby"];
  isDark: boolean;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: isDark
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [lng, lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const hotelEl = document.createElement("div");
    hotelEl.style.cssText =
      "width:40px;height:40px;border-radius:50%;background:#6366f1;border:3px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(99,102,241,0.5);";
    hotelEl.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 22V11l9-7 9 7v11"/><path d="M9 22V12h6v10"/></svg>';

    new maplibregl.Marker({ element: hotelEl })
      .setLngLat([lng, lat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<strong style="color:#1a1a2e">${hotelName}</strong>`
        )
      )
      .addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, hotelName, nearby, isDark]);

  return (
    <div className="glass-card rounded-[50px] overflow-hidden bento-hover border-white/5 min-h-[350px]">
      <div ref={mapContainer} className="h-[350px] w-full" />
    </div>
  );
}

/* ─── Nearby Card ─── */
function ForensicNearbyCard({
  name,
  type,
  distance,
  detail,
  crossRef,
  photoUrl,
  rating,
  reviewCount,
  isDark,
}: {
  name: string;
  type: string;
  distance: string;
  detail: string;
  crossRef?: string;
  photoUrl?: string;
  rating: number;
  reviewCount?: number;
  isDark: boolean;
}) {
  const typeIcon: Record<string, React.ReactNode> = {
    restaurant: <Utensils size={20} className="text-rose-400" />,
    beach: <Waves size={20} className="text-blue-400" />,
    bar: <Coffee size={20} className="text-purple-400" />,
    attraction: <Star size={20} className="text-amber-400" />,
  };

  return (
    <div className="glass-card p-8 rounded-[40px] bento-hover border-white/5 h-full flex flex-col justify-between shadow-2xl">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                {typeIcon[type] || <MapPin size={20} className="text-slate-400" />}
              </div>
            )}
            <div>
              <span className="text-xs font-black uppercase text-slate-500 italic block mb-1">
                {type === "restaurant" ? "Restoran" : type === "beach" ? "Plaza" : type === "bar" ? "Bar" : "Atrakcija"}
              </span>
              <h4 className={`text-lg font-black italic uppercase leading-none tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {name}
              </h4>
            </div>
          </div>
          <div className="bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
            <span className="text-[11px] font-black text-indigo-400 italic">{distance}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Star size={12} className="text-amber-400" fill="currentColor" />
            <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {rating}{reviewCount ? ` (${reviewCount})` : ""}
            </span>
          </div>
          <div className={`p-4 rounded-2xl border text-xs font-bold italic leading-relaxed ${isDark ? "bg-indigo-500/5 border-indigo-500/10 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-700"}`}>
            &quot;{crossRef || detail}&quot;
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN CONTENT COMPONENT
   ────────────────────────────────────────────── */
function HotelDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [analysis, setAnalysis] = useState<HotelAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Citam recenzije...");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null);

  const hotelName = searchParams.get("name") || "";
  const location = searchParams.get("location") || "";
  const googlePlaceId = searchParams.get("placeId") || undefined;

  const loadAnalysis = useCallback(
    async (forceRefresh = false) => {
      if (!hotelName || !location) return;
      if (!forceRefresh) setLoading(true);
      setError("");

      const steps = [
        "Trazim na Google-u...",
        "Citam recenzije...",
        "AI analiza u toku...",
        "Pripremam izvestaj...",
      ];
      let stepIdx = 0;
      const interval = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, steps.length - 1);
        setLoadingStep(steps[stepIdx]);
      }, 2500);

      try {
        const result = await fetchAnalysis(hotelName, location, googlePlaceId, forceRefresh);
        setAnalysis(result.data as HotelAnalysis);
        setFromCache(result.fromCache);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Greska pri analizi");
      } finally {
        clearInterval(interval);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hotelName, location, googlePlaceId]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalysis(true);
  };

  const REFRESH_THRESHOLD_DAYS = 90;
  const canRefresh = analysis?.cachedAt
    ? Date.now() - new Date(analysis.cachedAt).getTime() >
      REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
    : false;

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

  const handleCompare = () => {
    router.push("/compare");
  };

  /* ── Loading state ── */
  if (loading) return <ScanningLoader name={hotelName} step={loadingStep} isDark={isDark} />;

  /* ── Error state ── */
  if (error || !analysis) {
    return (
      <div className="text-center pt-32">
        <div className="glass-card border-rose-500/20 bg-rose-500/5 rounded-[35px] p-8 max-w-md mx-auto">
          <p className="text-rose-400 font-semibold mb-4">
            {error || "Nema podataka"}
          </p>
          <button
            onClick={() => loadAnalysis()}
            className="text-indigo-400 text-sm font-black uppercase tracking-widest cursor-pointer"
          >
            Pokusaj ponovo
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const worstCategory = [...analysis.scores].sort((a, b) => a.score - b.score)[0];
  return (
    <div className="animate-fade-in-up">

      {/* ─── Action Bar ─── */}
      <div className="flex items-center justify-end gap-3 mb-8 flex-wrap">
        {canRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`glass-card px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
              isDark ? "hover:bg-white/5 text-slate-400 border-amber-500/20" : "hover:bg-slate-100 text-slate-600 border-amber-500/20"
            }`}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="text-xs font-black uppercase tracking-widest">
              {refreshing ? "Osvezavam..." : "Osvezi"}
            </span>
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saved || saving}
          className={`glass-card px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
            saved
              ? "border-rose-500/30 text-rose-400"
              : isDark
                ? "hover:bg-white/5 text-slate-400"
                : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
          <span className="text-xs font-black uppercase tracking-widest">
            {saved ? "Sacuvano" : "Sacuvaj"}
          </span>
        </button>

        <button
          onClick={handleCompare}
          className={`glass-card px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
            isDark ? "hover:bg-white/5 text-indigo-400 border-indigo-500/20" : "hover:bg-slate-100 text-indigo-600 border-indigo-200"
          }`}
        >
          <BarChart3 size={14} />
          <span className="text-xs font-black uppercase tracking-widest">Uporedi</span>
        </button>

        <div className={`glass-card px-5 py-2 rounded-full flex items-center gap-2 ${
          isDark ? "border-indigo-500/30" : "border-indigo-200"
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`text-xs font-black tracking-widest uppercase ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
            {analysis.dataQuality === "full"
              ? "Verifikovan Izvestaj"
              : analysis.dataQuality === "partial"
                ? "Delimicno Verifikovan"
                : "AI Procena"}
          </span>
        </div>

        {fromCache && (
          <div className="glass-card px-4 py-2 rounded-full border-amber-500/30 bg-amber-500/10 flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400">
              Offline kes
            </span>
          </div>
        )}
      </div>

      {/* ─── Photo Gallery + Overlapping Identity Card ─── */}
      {analysis.photos && analysis.photos.length > 0 ? (
        <div className="relative mb-36 md:mb-48">
          {/* Gallery Grid */}
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[280px] md:h-[500px] rounded-[50px] overflow-hidden shadow-2xl border border-white/5">
            <div className="col-span-2 row-span-2 relative group overflow-hidden">
              <img
                src={analysis.photos[0]}
                alt="Photo 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-700" />
              <div className="absolute top-8 left-8 z-20">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                  <Sparkles size={14} className="text-indigo-400" /> AI Forenzika
                </div>
              </div>
            </div>
            {analysis.photos.slice(1, 4).map((url, i) => (
              <div key={i} className="col-span-1 row-span-1 relative overflow-hidden group">
                {url ? (
                  <img
                    src={url}
                    alt={`Photo ${i + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full ${isDark ? "bg-indigo-950/50" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
            <div className={`col-span-2 row-span-1 flex items-center justify-center relative group ${isDark ? "bg-slate-900/70" : "bg-slate-200/70"}`}>
              <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/15 transition-colors" />
              <span className={`text-[11px] font-black uppercase tracking-widest italic relative z-10 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                + {Math.max(analysis.photos.length - 4, 0)} Detaljna Skena
              </span>
            </div>
          </div>

          {/* Overlapping Identity Card */}
          <div className="absolute -bottom-24 md:-bottom-28 left-4 right-4 md:left-12 md:right-12 z-30">
            <div className={`glass-card p-8 md:p-12 rounded-[40px] md:rounded-[60px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-3xl ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  {analysis.verified ? (
                    <>
                      <Check size={16} className="text-emerald-500" strokeWidth={4} />
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">
                        Verifikovan Objekt
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} className="text-amber-400" />
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 italic">
                        AI Procena
                      </span>
                    </>
                  )}
                </div>
                <h1 className={`text-3xl md:text-6xl font-black italic uppercase leading-none tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                  {analysis.hotelName}
                </h1>
                <div className={`flex items-center justify-center md:justify-start gap-2 mt-5 font-bold text-[13px] uppercase tracking-widest italic ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  <MapPin size={16} className="text-indigo-500" />
                  {analysis.location} {analysis.priceRange ? `\u2022 ${analysis.priceRange}` : ""}
                </div>
              </div>

              {/* AI Truth Score Instrument */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[35px] md:rounded-[48px] flex flex-col items-center justify-center shadow-3xl border-2 transition-all hover:scale-105 group relative overflow-hidden ${
                  isDark ? "bg-indigo-600/10 border-indigo-500/30" : "bg-white border-indigo-100 shadow-indigo-100"
                }`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20" />
                  <span className="text-xs md:text-[12px] font-black uppercase tracking-tighter text-indigo-500 mb-1 relative z-10">
                    AI Truth Score
                  </span>
                  <span className="text-6xl md:text-8xl font-black italic text-gradient leading-none tracking-tighter relative z-10">
                    {analysis.aiScore.toFixed(1)}
                  </span>
                  <div className="w-12 h-1.5 bg-indigo-500/20 mt-3 rounded-full overflow-hidden relative z-10">
                    <div className="h-full bg-indigo-500" style={{ width: `${analysis.aiScore * 10}%` }} />
                  </div>
                </div>
                {/* Overall feedback */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleFeedback("overall", true)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      feedback["overall"] === true
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isDark
                          ? "hover:bg-white/5 text-slate-600"
                          : "hover:bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback("overall", false)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      feedback["overall"] === false
                        ? "bg-rose-500/20 text-rose-400"
                        : isDark
                          ? "hover:bg-white/5 text-slate-600"
                          : "hover:bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No photos: simpler header */
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            {analysis.verified ? (
              <>
                <Check size={16} className="text-emerald-500" strokeWidth={4} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">
                  Verifikovan Objekt
                </span>
              </>
            ) : (
              <>
                <ImageIcon size={16} className="text-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 italic">
                  AI Procena
                </span>
              </>
            )}
          </div>
          <h1 className="text-gradient text-4xl md:text-6xl font-black italic uppercase leading-none tracking-tighter mb-4">
            {analysis.hotelName}
          </h1>
          <p className={`text-sm font-bold flex items-center gap-2 mb-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            <MapPin size={16} className="text-indigo-500" />
            {analysis.location} {analysis.priceRange ? `\u2022 ${analysis.priceRange}` : ""}
          </p>

          {/* AI Trust Score Card */}
          <div className="glass-card p-8 rounded-[40px] relative overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <span className={`text-xs font-black uppercase tracking-widest mb-2 block ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  AI Trust Score
                </span>
                <div className="text-7xl font-black italic text-gradient leading-none">
                  {analysis.aiScore.toFixed(1)}
                </div>
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i <= Math.round(analysis.aiScore / 2) ? "#6366f1" : "transparent"}
                      className={i <= Math.round(analysis.aiScore / 2) ? "text-indigo-500" : isDark ? "text-slate-800" : "text-slate-300"}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleFeedback("overall", true)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      feedback["overall"] === true
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isDark
                          ? "hover:bg-white/5 text-slate-600"
                          : "hover:bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback("overall", false)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      feedback["overall"] === false
                        ? "bg-rose-500/20 text-rose-400"
                        : isDark
                          ? "hover:bg-white/5 text-slate-600"
                          : "hover:bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>
              <div className={`p-5 rounded-3xl border md:min-w-[180px] ${isDark ? "bg-slate-900/40 border-white/5" : "bg-slate-100 border-slate-200"}`}>
                <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Izvor podataka
                </span>
                <div className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {analysis.totalReviews.toLocaleString("sr-RS")} recenzija
                </div>
                {analysis.googleRating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {analysis.googleRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-600">Google</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysis.reviewSources.map((src) => (
                    <span
                      key={src}
                      className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${isDark ? "text-slate-600 bg-white/5" : "text-slate-500 bg-slate-200"}`}
                    >
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <p className={`text-sm leading-relaxed mb-10 max-w-3xl ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {analysis.summary}
      </p>

      {/* ─── Data Source Bar ─── */}
      <div className={`glass-card p-6 rounded-[35px] mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bento-hover ${
        isDark ? "border-white/5" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-4">
          <Globe size={18} className="text-indigo-400 flex-shrink-0" />
          <div>
            <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Volumen
            </span>
            <span className="text-2xl font-black italic text-indigo-400 leading-none">
              {analysis.totalReviews.toLocaleString("sr-RS")} rec.
            </span>
          </div>
        </div>
        {analysis.googleRating && (
          <div className="flex items-center gap-3">
            <Star size={14} className="text-amber-400" fill="currentColor" />
            <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {analysis.googleRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold">Google</span>
          </div>
        )}
        {analysis.verified && (
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
              Google Verifikovano
            </span>
          </div>
        )}
        {/* Language breakdown inline */}
        {analysis.languageBreakdown && analysis.languageBreakdown.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {analysis.languageBreakdown.map((lang) => (
              <span
                key={lang.language}
                className={`text-sm font-medium whitespace-nowrap ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                {lang.flag} {lang.count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── Section: Analiticka Matrica & Intelligence ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-24">
        {/* Left: Matrix Grid */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-[12px] font-black uppercase tracking-[0.5em] italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Analiticka Matrica
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase text-indigo-500 italic">
              <BarChart3 size={16} /> Detaljna analiza
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {analysis.scores.map((s) => (
              <MatrixCard
                key={s.category}
                icon={categoryIcons[s.category] || <ThermometerSun size={20} />}
                name={s.category}
                score={s.score}
                trend={s.trend}
                isDark={isDark}
                sampleQuote={s.sampleQuote}
                mentionCount={s.mentionCount}
                detail={s.detail}
                onFeedback={(isCorrect) => handleFeedback(s.category, isCorrect)}
                feedbackValue={feedback[s.category]}
              />
            ))}
          </div>

          {/* AI Insajderski Savet */}
          <div className={`glass-card rounded-[45px] border-purple-500/20 bg-gradient-to-br from-purple-600/5 to-transparent relative group overflow-hidden bento-hover`}>
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-[4s]">
              <Lightbulb size={180} />
            </div>
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-400 italic">
                  AI Insajderski Savet
                </h4>
              </div>
              <div className={`mt-6 p-6 rounded-3xl ${isDark ? "bg-white/[0.02]" : "bg-black/[0.02]"}`}>
                <p className={`text-lg md:text-xl font-bold italic leading-relaxed tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  &ldquo;{analysis.aiTip}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Forensic Conclusions */}
        <div className="lg:col-span-1 space-y-8">
          <h3 className={`text-[12px] font-black uppercase tracking-[0.5em] italic px-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Zakljucci Istrage
          </h3>

          {/* Best pro as positive */}
          {analysis.pros.length > 0 && (
            <ReportCard
              type="pos"
              title="Dominantna Prednost"
              text={analysis.pros[0]}
              isDark={isDark}
            />
          )}

          {/* Worst con as negative */}
          {analysis.cons.length > 0 && (
            <ReportCard
              type="neg"
              title="Kriticna Mana"
              text={analysis.cons[0]}
              isDark={isDark}
            />
          )}

          {/* Warning if worst category < 6 */}
          {worstCategory && worstCategory.score < 6 && (
            <ReportCard
              type="alert"
              title={`Upozorenje: ${worstCategory.category}`}
              text={`${worstCategory.detail} (Ocena: ${worstCategory.score.toFixed(1)})`}
              isDark={isDark}
            />
          )}

          {/* Review volume & status card */}
          <div className={`glass-card p-8 rounded-[35px] flex items-center justify-between bento-hover ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <div>
              <span className={`text-xs font-black uppercase italic block mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Ocena
              </span>
              <span className="text-2xl font-black italic text-indigo-400">
                {analysis.aiScore.toFixed(1)}
              </span>
            </div>
            <div className={`w-px h-12 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
            <div className="text-right">
              <span className={`text-xs font-black uppercase italic block mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Status
              </span>
              <span className={`text-2xl font-black italic ${analysis.aiScore >= 7 ? "text-emerald-500" : analysis.aiScore >= 5 ? "text-amber-500" : "text-rose-500"}`}>
                {analysis.aiScore >= 7 ? "Cist" : analysis.aiScore >= 5 ? "Rizik" : "Oprez"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Pros & Cons Full List ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
        <div className={`glass-card p-8 rounded-[45px] bento-hover ${isDark ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-emerald-200 bg-emerald-50/50"}`}>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400 mb-6 italic flex items-center gap-3">
            <Check size={16} strokeWidth={4} /> Prednosti
          </h3>
          {analysis.pros.map((pro, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0 shadow-[0_0_8px_#10b981]" />
              <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {pro}
              </p>
            </div>
          ))}
        </div>
        <div className={`glass-card p-8 rounded-[45px] bento-hover ${isDark ? "border-rose-500/10 bg-rose-500/[0.02]" : "border-rose-200 bg-rose-50/50"}`}>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rose-400 mb-6 italic flex items-center gap-3">
            <X size={16} strokeWidth={4} /> Mane
          </h3>
          {analysis.cons.map((con, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 flex-shrink-0 shadow-[0_0_8px_#f43f5e]" />
              <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {con}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Market Audit & Map ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
        {/* Market Audit Bars */}
        {analysis.languageBreakdown && analysis.languageBreakdown.length > 0 && (
          <div className="glass-card p-12 rounded-[50px] bento-hover">
            <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-10 italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Audit po trzistima
            </h4>
            <div className="space-y-8">
              {analysis.languageBreakdown.map((lang) => {
                const total = analysis.languageBreakdown!.reduce((sum, l) => sum + l.count, 0);
                const pct = total > 0 ? Math.round((lang.count / total) * 100) : 0;
                return (
                  <MarketBar
                    key={lang.language}
                    flag={lang.flag}
                    name={lang.language}
                    val={pct}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Map */}
        {analysis.latitude && analysis.longitude && (
          <MiniMap
            lat={analysis.latitude}
            lng={analysis.longitude}
            hotelName={analysis.hotelName}
            nearby={analysis.nearby}
            isDark={isDark}
          />
        )}
      </div>

      {/* ─── Nearby Cross-Reference ─── */}
      {analysis.nearby.length > 0 && (
        <div className="mb-24">
          <h3 className={`text-[12px] font-black uppercase tracking-[0.5em] italic px-2 mb-10 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Okolni sadrzaji
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {analysis.nearby.map((place, i) => (
              <ForensicNearbyCard
                key={i}
                name={place.name}
                type={place.type}
                distance={place.distance}
                detail={place.detail}
                crossRef={place.crossRef}
                photoUrl={place.photoUrl}
                rating={place.rating}
                reviewCount={place.reviewCount}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Critical Warning ─── */}
      {worstCategory && worstCategory.score < 5 && (
        <div className={`glass-card p-8 rounded-[40px] mb-12 shadow-lg bento-hover ${isDark ? "border-rose-500/30 bg-rose-500/[0.03]" : "border-rose-300 bg-rose-50"}`}>
          <div className="flex items-center gap-4 mb-4">
            <ShieldAlert className="text-rose-500" size={28} />
            <span className="text-sm font-black text-rose-500 uppercase tracking-widest italic">
              Kriticno Upozorenje
            </span>
          </div>
          <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            <strong>{worstCategory.category}</strong> je najslabija tacka sa ocenom{" "}
            <strong className="text-rose-400">{worstCategory.score.toFixed(1)}</strong>.{" "}
            {worstCategory.detail}
          </p>
        </div>
      )}

      {/* ─── Best For Tags ─── */}
      <div className="flex flex-wrap gap-3 mb-12">
        {analysis.bestFor.map((tag) => (
          <span
            key={tag}
            className={`glass-card px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest bento-hover cursor-default ${
              isDark ? "text-indigo-400 border-indigo-500/20" : "text-indigo-600 border-indigo-200"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ─── Footer Signature ─── */}
      <FooterSignature />
    </div>
  );
}

/* ──────────────────────────────────────────────
   PAGE WRAPPER
   ────────────────────────────────────────────── */
export default function HotelDetailPage() {
  return (
    <>
      <div className="px-4 md:px-10">
        <PageHeader label="Forenzicki Dosije" />
      </div>

      <main className="flex-1 px-4 md:px-10 pb-8 relative z-10">
        <div className="max-w-6xl mx-auto w-full">
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
    </>
  );
}
