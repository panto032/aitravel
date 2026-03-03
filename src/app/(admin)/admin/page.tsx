"use client";

import { useState, useEffect } from "react";
import {
  Users, Crown, DollarSign, Database,
  Search, BarChart3, MapPin, Clock,
  TrendingUp, Activity, ThumbsUp, ThumbsDown,
  ArrowUpRight, ArrowDownRight, Zap, Cpu,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

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

function MetricCard({
  label,
  value,
  trend,
  icon,
  color = "indigo",
  isDark,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "rose" | "amber" | "purple";
  isDark: boolean;
}) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-500",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
    purple: "text-purple-500",
  };

  return (
    <div className="glass-card p-8 rounded-[35px] bento-hover border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black italic ${trend.includes("+") ? "text-emerald-500" : "text-rose-500"}`}>
            {trend.includes("+") ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 italic leading-none">
          {label}
        </span>
        <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-gradient leading-none">
          {value}
        </span>
      </div>
    </div>
  );
}

function HealthBar({ name, val, color }: { name: string; val: number; color: "emerald" | "indigo" }) {
  const colors = { emerald: "bg-emerald-500", indigo: "bg-indigo-500" };
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase text-slate-500 italic">{name}</span>
        <span className={`text-[10px] font-black ${val === 100 ? "text-emerald-500" : "text-indigo-400"}`}>{val}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]}`} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          <p className="text-rose-400 font-semibold">Greska pri ucitavanju</p>
        </div>
      </div>
    );
  }

  const costDiff =
    stats.costs.lastMonth > 0
      ? (((stats.costs.thisMonth - stats.costs.lastMonth) / stats.costs.lastMonth) * 100).toFixed(0)
      : "0";

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-gradient text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">
          Command Center
        </h1>
        <p className={`font-semibold italic text-sm ${isDark ? "text-slate-500" : "text-slate-600"}`}>
          Monitoring sistemske inteligencije i troskova
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard
          label="Korisnici"
          value={stats.users.total}
          trend={`+${stats.users.newThisMonth}`}
          icon={<Users size={18} />}
          color="indigo"
          isDark={isDark}
        />
        <MetricCard
          label="Premium"
          value={stats.users.premium}
          icon={<Crown size={18} />}
          color="emerald"
          isDark={isDark}
        />
        <MetricCard
          label="API Trosak"
          value={`$${stats.costs.thisMonth.toFixed(2)}`}
          trend={`${Number(costDiff) >= 0 ? "+" : ""}${costDiff}%`}
          icon={<DollarSign size={18} />}
          color="rose"
          isDark={isDark}
        />
        <MetricCard
          label="Cache Hit"
          value={`${stats.cache.hitRate}%`}
          icon={<Database size={18} />}
          color="amber"
          isDark={isDark}
        />
      </div>

      {/* Activity + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Recent Activity */}
        <div className="lg:col-span-8 glass-card rounded-[45px] overflow-hidden flex flex-col border-white/5">
          <div className={`p-8 flex items-center justify-between border-b ${isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] italic leading-none ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Live Stream Istraga
            </h3>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b text-[9px] font-black uppercase tracking-widest ${isDark ? "border-white/5 text-slate-600" : "border-black/5 text-slate-400"}`}>
                  <th className="px-8 py-5">Korisnik</th>
                  <th className="px-8 py-5">Pretraga</th>
                  <th className="px-8 py-5 text-right">Datum</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold italic">
                {stats.recentSearches.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-6 text-center text-slate-600">
                      Nema podataka
                    </td>
                  </tr>
                ) : (
                  stats.recentSearches.slice(0, 8).map((s, i) => (
                    <tr
                      key={i}
                      className={`border-b hover:bg-white/[0.02] transition-colors ${isDark ? "border-white/5" : "border-black/5"}`}
                    >
                      <td className="px-8 py-5">
                        <span className={isDark ? "text-slate-400" : "text-slate-600"}>{s.user}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={isDark ? "text-slate-200" : "text-slate-800"}>{s.query}</span>
                      </td>
                      <td className="px-8 py-5 text-right text-slate-600 text-xs">
                        {new Date(s.date).toLocaleDateString("sr-RS")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Health */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 rounded-[45px] bento-hover border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 italic leading-none">
              API Health Status
            </h3>
            <div className="space-y-6">
              <HealthBar name="Google Places Engine" val={98} color="emerald" />
              <HealthBar name="TravelAI Neural Node" val={95} color="indigo" />
              <HealthBar name="Caching Service" val={100} color="emerald" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-[28px] border-emerald-500/10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={18} className="text-emerald-400" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                Status
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                Sistem aktivan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {stats.costs.breakdown && stats.costs.breakdown.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign size={18} className="text-rose-400" />
            <h2 className={`text-lg font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
              Troskovi po provajderu
            </h2>
          </div>
          <div className="glass-card rounded-[35px] overflow-hidden">
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
                  className={`flex items-center justify-between px-8 py-5 ${
                    i < stats.costs.breakdown!.length - 1
                      ? isDark ? "border-b border-white/5" : "border-b border-black/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold uppercase ${providerColors[item.model] || "text-slate-400"}`}>
                      {item.model}
                    </span>
                    <span className="text-[10px] text-slate-600">{item.count} poziva</span>
                  </div>
                  <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    ${item.cost.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {stats.feedback && stats.feedback.totalFeedback > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ThumbsUp size={18} className="text-emerald-400" />
            <h2 className={`text-lg font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
              AI Feedback
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass-card rounded-[28px] p-6 border-emerald-500/20">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                Ukupno glasova
              </p>
              <p className={`text-2xl font-black italic ${isDark ? "text-white" : "text-slate-900"}`}>
                {stats.feedback.totalFeedback}
              </p>
            </div>
            <div className="glass-card rounded-[28px] p-6 border-emerald-500/20">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                Tacnost
              </p>
              <p className="text-2xl font-black italic text-emerald-400">
                {stats.feedback.correctPercent}%
              </p>
            </div>
          </div>

          {stats.feedback.recentIncorrect.length > 0 && (
            <div className="glass-card rounded-[28px] overflow-hidden">
              <div className={`px-6 py-4 border-b ${isDark ? "border-white/5" : "border-black/5"}`}>
                <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <ThumbsDown size={12} /> Hoteli sa najvise &quot;Netacno&quot; glasova
                </p>
              </div>
              {stats.feedback.recentIncorrect.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-6 py-4 ${
                    i < stats.feedback!.recentIncorrect.length - 1
                      ? isDark ? "border-b border-white/5" : "border-b border-black/5"
                      : ""
                  }`}
                >
                  <div>
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {item.hotelName}
                    </span>
                    <span className="text-slate-600 text-xs ml-2">({item.category})</span>
                  </div>
                  <span className="text-rose-400 text-sm font-bold">{item.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Destinations + Recent Searches */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={18} className="text-indigo-400" />
            <h2 className={`text-lg font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
              Top destinacije
            </h2>
          </div>
          <div className="glass-card rounded-[35px] overflow-hidden">
            {stats.topDestinations.length === 0 ? (
              <p className="p-8 text-slate-600 text-sm text-center font-medium">Nema podataka</p>
            ) : (
              stats.topDestinations.map((d, i) => (
                <div
                  key={d.query}
                  className={`flex items-center justify-between px-6 py-5 ${
                    i < stats.topDestinations.length - 1
                      ? isDark ? "border-b border-white/5" : "border-b border-black/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <MapPin size={14} className="text-indigo-400" />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{d.query}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {d.count} pretraga
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <Clock size={18} className="text-emerald-400" />
            <h2 className={`text-lg font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
              Poslednje pretrage
            </h2>
          </div>
          <div className="glass-card rounded-[35px] overflow-hidden">
            {stats.recentSearches.length === 0 ? (
              <p className="p-8 text-slate-600 text-sm text-center font-medium">Nema podataka</p>
            ) : (
              stats.recentSearches.slice(0, 10).map((s, i) => (
                <div
                  key={i}
                  className={`px-6 py-5 ${
                    i < Math.min(stats.recentSearches.length, 10) - 1
                      ? isDark ? "border-b border-white/5" : "border-b border-black/5"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{s.query}</span>
                    <span className="text-slate-600 text-[10px] font-bold flex-shrink-0 ml-3">
                      {new Date(s.date).toLocaleDateString("sr-RS")}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs font-medium">{s.user}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Signature */}
      <div className={`flex justify-center pt-12 pb-8 text-[9px] font-black uppercase tracking-[0.5em] italic ${isDark ? "text-slate-800" : "text-slate-400"}`}>
        KREIRAO{" "}
        <span className="text-indigo-500 mx-2 underline decoration-2 underline-offset-4">IMPULSE</span>{" "}
        PART OF <span className="text-indigo-400 ml-1">IMPULS TECH DOO</span>
      </div>
    </div>
  );
}
