"use client";

import { useState, useEffect } from "react";
import {
  Users, Crown, DollarSign, Database,
  Search, BarChart3, MapPin, Clock,
  TrendingUp, Activity, ThumbsUp, ThumbsDown,
} from "lucide-react";

interface Stats {
  users: { total: number; newThisMonth: number; premium: number };
  searches: { total: number; thisMonth: number };
  analyses: { total: number; thisMonth: number };
  costs: {
    thisMonth: number;
    lastMonth: number;
    breakdown?: { model: string; cost: number; count: number }[];
  };
  cache: { hitRate: string; cachedRequests: number; totalRequests: number };
  recentSearches: { query: string; user: string; date: string }[];
  topDestinations: { query: string; count: number }[];
  feedback?: {
    totalFeedback: number;
    correctPercent: number;
    recentIncorrect: { hotelName: string; category: string; count: number }[];
  };
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "rose" | "amber";
}) {
  const borderColors = {
    indigo: "border-indigo-500/20 hover:border-indigo-500/40",
    emerald: "border-emerald-500/20 hover:border-emerald-500/40",
    rose: "border-rose-500/20 hover:border-rose-500/40",
    amber: "border-amber-500/20 hover:border-amber-500/40",
  };

  const iconBg = {
    indigo: "bg-indigo-500/15 text-indigo-400",
    emerald: "bg-emerald-500/15 text-emerald-400",
    rose: "bg-rose-500/15 text-rose-400",
    amber: "bg-amber-500/15 text-amber-400",
  };

  return (
    <div
      className={`glass-card ${borderColors[color]} rounded-[28px] p-5 transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black italic text-white">{value}</p>
      {sub && (
        <p className="text-slate-600 text-[11px] font-medium mt-1">{sub}</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center pt-20">
        <div className="glass-card border-rose-500/20 bg-rose-500/5 rounded-[35px] p-8 max-w-md mx-auto">
          <p className="text-rose-400 font-semibold">
            Greška pri učitavanju
          </p>
        </div>
      </div>
    );
  }

  const costDiff =
    stats.costs.lastMonth > 0
      ? (
          ((stats.costs.thisMonth - stats.costs.lastMonth) /
            stats.costs.lastMonth) *
          100
        ).toFixed(0)
      : "0";

  return (
    <div className="max-w-5xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter mb-1">
          Dashboard
        </h1>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          Pregled sistema u realnom vremenu
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Korisnici"
          value={stats.users.total}
          sub={`+${stats.users.newThisMonth} ovog meseca`}
          icon={<Users size={18} />}
          color="indigo"
        />
        <StatCard
          label="Premium"
          value={stats.users.premium}
          icon={<Crown size={18} />}
          color="emerald"
        />
        <StatCard
          label="API trošak"
          value={`$${stats.costs.thisMonth.toFixed(2)}`}
          sub={`${Number(costDiff) >= 0 ? "+" : ""}${costDiff}% vs prošli mesec`}
          icon={<DollarSign size={18} />}
          color="rose"
        />
        <StatCard
          label="Cache hit"
          value={`${stats.cache.hitRate}%`}
          sub={`${stats.cache.cachedRequests}/${stats.cache.totalRequests}`}
          icon={<Database size={18} />}
          color="amber"
        />
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Pretrage (mesec)"
          value={stats.searches.thisMonth}
          sub={`Ukupno: ${stats.searches.total}`}
          icon={<Search size={18} />}
          color="indigo"
        />
        <StatCard
          label="Analize (mesec)"
          value={stats.analyses.thisMonth}
          sub={`Ukupno: ${stats.analyses.total}`}
          icon={<BarChart3 size={18} />}
          color="emerald"
        />
        <div className="glass-card rounded-[28px] p-5 border-indigo-500/10 flex flex-col justify-center col-span-2 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} className="text-indigo-400" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Status
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white font-bold text-sm">
              Sistem aktivan
            </span>
            <span className="text-slate-600 text-xs">
              • Prošli mesec: ${stats.costs.lastMonth.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown by Provider */}
      {stats.costs.breakdown && stats.costs.breakdown.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={18} className="text-rose-400" />
            <h2 className="text-lg font-black italic tracking-tighter">
              Troškovi po provajderu
            </h2>
          </div>
          <div className="glass-card rounded-[28px] overflow-hidden">
            {stats.costs.breakdown.map((item, i) => {
              const providerColors: Record<string, string> = {
                haiku: "text-blue-400",
                sonnet: "text-purple-400",
                gemini: "text-amber-400",
                google: "text-emerald-400",
                cache: "text-slate-500",
              };
              return (
                <div
                  key={item.model}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < stats.costs.breakdown!.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold uppercase ${
                        providerColors[item.model] || "text-slate-400"
                      }`}
                    >
                      {item.model}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {item.count} poziva
                    </span>
                  </div>
                  <span className="text-white font-bold">
                    ${item.cost.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Feedback Stats */}
      {stats.feedback && stats.feedback.totalFeedback > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <ThumbsUp size={18} className="text-emerald-400" />
            <h2 className="text-lg font-black italic tracking-tighter">
              AI Feedback
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass-card rounded-[28px] p-5 border-emerald-500/20">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                Ukupno glasova
              </p>
              <p className="text-2xl font-black italic text-white">
                {stats.feedback.totalFeedback}
              </p>
            </div>
            <div className="glass-card rounded-[28px] p-5 border-emerald-500/20">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                Tačnost
              </p>
              <p className="text-2xl font-black italic text-emerald-400">
                {stats.feedback.correctPercent}%
              </p>
            </div>
          </div>

          {stats.feedback.recentIncorrect.length > 0 && (
            <div className="glass-card rounded-[28px] overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5">
                <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <ThumbsDown size={12} /> Hoteli sa najviše &quot;Netačno&quot; glasova
                </p>
              </div>
              {stats.feedback.recentIncorrect.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i < stats.feedback!.recentIncorrect.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <div>
                    <span className="text-white text-sm font-bold">
                      {item.hotelName}
                    </span>
                    <span className="text-slate-600 text-xs ml-2">
                      ({item.category})
                    </span>
                  </div>
                  <span className="text-rose-400 text-sm font-bold">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={18} className="text-indigo-400" />
            <h2 className="text-lg font-black italic tracking-tighter">
              Top destinacije
            </h2>
          </div>
          <div className="glass-card rounded-[28px] overflow-hidden">
            {stats.topDestinations.length === 0 ? (
              <p className="p-6 text-slate-600 text-sm text-center font-medium">
                Nema podataka
              </p>
            ) : (
              stats.topDestinations.map((d, i) => (
                <div
                  key={d.query}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < stats.topDestinations.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <MapPin size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-white text-sm font-bold">
                      {d.query}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {d.count} pretraga
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Searches */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Clock size={18} className="text-emerald-400" />
            <h2 className="text-lg font-black italic tracking-tighter">
              Poslednje pretrage
            </h2>
          </div>
          <div className="glass-card rounded-[28px] overflow-hidden">
            {stats.recentSearches.length === 0 ? (
              <p className="p-6 text-slate-600 text-sm text-center font-medium">
                Nema podataka
              </p>
            ) : (
              stats.recentSearches.slice(0, 10).map((s, i) => (
                <div
                  key={i}
                  className={`px-5 py-4 ${
                    i < Math.min(stats.recentSearches.length, 10) - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-white text-sm font-bold">
                      {s.query}
                    </span>
                    <span className="text-slate-600 text-[10px] font-bold flex-shrink-0 ml-3">
                      {new Date(s.date).toLocaleDateString("sr-RS")}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs font-medium">
                    {s.user}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
