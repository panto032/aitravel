"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Target, ArrowRight, Sparkles, Search, MapPin, Wifi, Coffee, Bed,
  Users, Star, Shield, TrendingUp, Check, X as XIcon, ChevronRight,
} from "lucide-react";

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
}: {
  hotel: ShowcaseHotel;
  onClose: () => void;
}) {
  const scoreColor =
    (hotel.aiScore || 0) >= 8
      ? "text-emerald-400"
      : (hotel.aiScore || 0) >= 6
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-[35px] max-w-md w-full p-8 border-white/10 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-white">{hotel.name}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              {hotel.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <XIcon size={16} className="text-slate-400" />
          </button>
        </div>

        {/* AI Score */}
        <div className="text-center mb-6">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
            AI Trust Rating
          </div>
          <div className={`text-5xl font-black italic ${scoreColor}`}>
            {(hotel.aiScore || 0).toFixed(1)}
          </div>
          <div className="text-xs text-slate-600 mt-1">/10</div>
        </div>

        {/* Top 3 Categories */}
        {hotel.topScores.length > 0 && (
          <div className="space-y-3 mb-6">
            {hotel.topScores.map((s) => (
              <div key={s.category} className="flex items-center justify-between">
                <span className="text-sm text-slate-400 font-medium">{s.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.score >= 8
                          ? "bg-emerald-500"
                          : s.score >= 6
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                      style={{ width: `${s.score * 10}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm w-8 text-right">
                    {s.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pros / Cons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-2">
              Prednosti
            </div>
            {hotel.pros.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-slate-400">{p}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-2">
              Mane
            </div>
            {hotel.cons.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1">
                <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-slate-400">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/register"
          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          Kreiraj besplatan nalog <ArrowRight size={16} />
        </Link>
        <p className="text-center text-[10px] text-slate-600 mt-3">
          Za kompletnu analizu sa svim kategorijama
        </p>
      </div>
    </div>
  );
}

const categoryShowcase = [
  { icon: <MapPin size={20} />, name: "Lokacija", score: "8.5" },
  { icon: <Sparkles size={20} />, name: "Čistoća", score: "7.2" },
  { icon: <Users size={20} />, name: "Osoblje", score: "9.0" },
  { icon: <Bed size={20} />, name: "Sobe", score: "6.5" },
  { icon: <Coffee size={20} />, name: "Doručak", score: "4.0" },
  { icon: <Wifi size={20} />, name: "WiFi", score: "3.5" },
  { icon: <Star size={20} />, name: "Vrednost", score: "7.8" },
];

export default function LandingPage() {
  const [showcase, setShowcase] = useState<ShowcaseData | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<ShowcaseHotel | null>(null);

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
    <div className="min-h-screen bg-[#020205] text-slate-100 relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="h-20 px-6 md:px-10 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
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

      {/* SECTION 1: Hero */}
      <section className="flex flex-col items-center justify-center px-6 text-center pt-16 md:pt-24 pb-20 relative z-10">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2.5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Besplatno — Zauvek
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[1.0] tracking-tighter mb-6 text-gradient italic">
            Putuj bez maski.
          </h1>

          <p className="text-slate-500 text-base md:text-xl leading-relaxed font-medium mb-12 max-w-xl mx-auto">
            Prva platforma koja analizira hiljade recenzija pomoću AI agenata
            kako bi ti pokazala šta se stvarno dešava u hotelu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 px-8 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40"
            >
              <Search size={18} /> Kreiraj besplatan nalog
            </Link>
            <Link
              href="/login"
              className="h-14 glass-card rounded-2xl font-bold text-sm text-slate-400 flex items-center justify-center gap-3 px-8 hover:bg-white/5 transition-all"
            >
              Već imam nalog
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: How it works */}
      <section className="px-6 pb-24 relative z-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-center mb-12">
          Kako TravelAI razbija predrasude?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Pretraži hotel",
              desc: "Ukucaj ime hotela ili destinaciju. AI pronalazi sve dostupne podatke.",
              icon: <Search size={28} />,
            },
            {
              step: "2",
              title: "AI čita hiljade recenzija",
              desc: "3 AI agenta analiziraju sve u sekundama — na 5+ jezika, sa detekcijom sarkazma.",
              icon: <Sparkles size={28} />,
            },
            {
              step: "3",
              title: "Dobijaš iskrenu analizu",
              desc: "Sa pravim citatima, ocenama po kategorijama, i nearby preporukama.",
              icon: <Shield size={28} />,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass-card rounded-[28px] p-8 text-center group hover:bg-white/5 transition-all"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="text-xs font-black text-indigo-400 tracking-widest uppercase mb-3">
                Korak {item.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Stats */}
      <section className="px-6 pb-24 relative z-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-center mb-12">
          Brojke ne lažu.
        </h2>
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {[
            {
              value: Math.max(stats.totalReviews, 1000),
              suffix: "+",
              label: "recenzija analizirano",
            },
            {
              value: Math.max(stats.totalHotels, 50),
              suffix: "+",
              label: "hotela ocenjeno",
            },
            {
              value: Math.max(stats.totalLocations, 10),
              suffix: "+",
              label: "destinacija pokriveno",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-[28px] p-6 md:p-8 text-center"
            >
              <div className="text-3xl md:text-5xl font-black italic text-white mb-2">
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: Showcase */}
      {showcase && showcase.hotels.length > 0 && (
        <section className="px-6 pb-24 relative z-10 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-center mb-4">
            Pogledaj šta su naši korisnici otkrili
          </h2>
          <p className="text-slate-500 text-sm text-center mb-12">
            Pravi hoteli, prave recenzije, prave ocene.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcase.hotels.slice(0, 6).map((hotel) => {
              const scoreColor =
                (hotel.aiScore || 0) >= 8
                  ? "text-emerald-400"
                  : (hotel.aiScore || 0) >= 6
                    ? "text-amber-400"
                    : "text-rose-400";

              return (
                <div
                  key={hotel.id}
                  className="glass-card rounded-[28px] overflow-hidden group hover:border-indigo-500/30 transition-all cursor-pointer"
                  onClick={() => setSelectedHotel(hotel)}
                >
                  {/* Photo */}
                  <div className="h-40 bg-slate-900 relative overflow-hidden">
                    {hotel.photoUrl ? (
                      <img
                        src={hotel.photoUrl}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin size={32} className="text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-white mb-0.5">
                      {hotel.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                      {hotel.location}
                    </p>

                    <div className="flex items-center gap-4 mb-3">
                      {hotel.googleRating && (
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400" fill="currentColor" />
                          <span className="text-sm font-bold text-white">
                            {hotel.googleRating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-600">Google</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span className={`text-sm font-bold ${scoreColor}`}>
                          {(hotel.aiScore || 0).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-600">AI</span>
                      </div>
                    </div>

                    {hotel.googleReviewCount && (
                      <p className="text-[10px] text-slate-600 mb-3">
                        {hotel.googleReviewCount.toLocaleString("sr-RS")} recenzija
                      </p>
                    )}

                    {hotel.summary && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 mb-3">
                        &quot;{hotel.summary}&quot;
                      </p>
                    )}

                    <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                      Vidi analizu <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 5: What we analyze */}
      <section className="px-6 pb-24 relative z-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-center mb-4">
          Duboka analiza — ne samo ocena
        </h2>
        <p className="text-slate-500 text-sm text-center mb-12">
          7 kategorija, pravi citati, trendovi, cross-reference sa okolinom.
        </p>

        <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-8">
          {categoryShowcase.map((cat) => {
            const score = parseFloat(cat.score);
            const color =
              score >= 8
                ? "text-emerald-400 border-emerald-500/20"
                : score >= 6
                  ? "text-white border-white/10"
                  : score >= 4
                    ? "text-amber-400 border-amber-500/20"
                    : "text-rose-400 border-rose-500/20";
            return (
              <div
                key={cat.name}
                className={`glass-card rounded-[20px] p-4 text-center border ${color.split(" ")[1]}`}
              >
                <div className="text-indigo-400 flex justify-center mb-2">
                  {cat.icon}
                </div>
                <div className={`text-lg font-black italic mb-1 ${color.split(" ")[0]}`}>
                  {cat.score}
                </div>
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  {cat.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {["Nearby preporuke", "AI Secret Tip", "Trend analiza", "Uporedi hotele"].map(
            (f) => (
              <span
                key={f}
                className="glass-card px-4 py-2 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest"
              >
                + {f}
              </span>
            )
          )}
        </div>
      </section>

      {/* SECTION 6: Free forever */}
      <section className="px-6 pb-24 relative z-10 max-w-3xl mx-auto">
        <div className="glass-card rounded-[35px] p-8 md:p-12 text-center border-emerald-500/20 bg-emerald-500/[0.02]">
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-8">
            Potpuno besplatno. Zauvek.
          </h2>

          <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
            {[
              "10 pretraga mesečno — besplatno",
              "Detaljna AI analiza — besplatno",
              "Čuvaj omiljene hotele — besplatno",
              "Uporedi hotele — besplatno",
              "Google verifikovani podaci",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <Check size={16} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300 font-medium">{feat}</span>
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="inline-flex h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest items-center justify-center gap-3 px-10 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40"
          >
            Kreiraj besplatan nalog <ArrowRight size={18} />
          </Link>

          <p className="text-slate-600 text-xs mt-6">
            Premium: Neograničene pretrage za samo €4.99/mesečno
          </p>
        </div>
      </section>

      {/* SECTION 7: Social proof */}
      <section className="px-6 pb-24 relative z-10 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-center mb-10">
          Koriste ga putnici iz celog regiona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              text: "Konačno neko ko mi kaže istinu o hotelu pre nego dam pare.",
              author: "Marko",
              city: "Beograd",
            },
            {
              text: "Doručak u hotelu je bio katastrofa — tačno kako je AI predvideo.",
              author: "Ana",
              city: "Zagreb",
            },
          ].map((t) => (
            <div
              key={t.author}
              className="glass-card rounded-[28px] p-6 md:p-8"
            >
              <p className="text-sm text-slate-300 italic leading-relaxed mb-4">
                &quot;{t.text}&quot;
              </p>
              <p className="text-xs text-slate-600 font-bold">
                — {t.author}, {t.city}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: Footer CTA */}
      <section className="px-6 pb-16 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6 text-gradient">
          Ne putuj naslepo.
        </h2>
        <Link
          href="/register"
          className="inline-flex h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest items-center justify-center gap-3 px-10 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40 mb-8"
        >
          Kreiraj besplatan nalog — za 30 sekundi
        </Link>
        <div className="text-slate-700 text-xs font-medium">
          TravelAI © 2026 | Uslovi | Privatnost
        </div>
      </section>

      {/* Preview Modal */}
      {selectedHotel && (
        <PreviewModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </div>
  );
}
