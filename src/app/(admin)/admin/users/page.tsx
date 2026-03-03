"use client";

import { useState, useEffect } from "react";
import { Users, Search, Crown, ShieldAlert, Ban } from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  plan: "FREE" | "PREMIUM";
  isActive: boolean;
  createdAt: string;
  _count: {
    searchHistory: number;
    savedAnalyses: number;
    apiUsage: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateUser = async (
    userId: string,
    data: Record<string, unknown>
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
        );
      }
    } catch {
      /* ignore */
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter mb-1">Korisnici</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            {users.length} registrovanih korisnika
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="glass-card rounded-2xl p-2 flex items-center gap-2 focus-within:border-indigo-500/50 transition-all w-full md:w-72">
            <Search size={16} className="ml-2 text-slate-500" />
            <input
              type="text"
              placeholder="Pretraži korisnike..."
              className="bg-transparent flex-1 h-8 outline-none text-sm font-semibold text-white placeholder:text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-[24px] p-4 text-center">
          <Users size={18} className="text-indigo-400 mx-auto mb-2" />
          <div className="text-xl font-black italic text-white">{users.length}</div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ukupno</div>
        </div>
        <div className="glass-card rounded-[24px] p-4 text-center">
          <Crown size={18} className="text-emerald-400 mx-auto mb-2" />
          <div className="text-xl font-black italic text-white">
            {users.filter((u) => u.plan === "PREMIUM").length}
          </div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Premium</div>
        </div>
        <div className="glass-card rounded-[24px] p-4 text-center">
          <Ban size={18} className="text-rose-400 mx-auto mb-2" />
          <div className="text-xl font-black italic text-white">
            {users.filter((u) => !u.isActive).length}
          </div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neaktivni</div>
        </div>
      </div>

      {/* User list */}
      <div className="space-y-4">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="glass-card p-6 rounded-[28px] hover:bg-white/5 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* User info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold text-base truncate">
                      {user.name || "Bez imena"}
                    </h3>
                    {user.role === "ADMIN" && (
                      <span className="flex items-center gap-1 bg-rose-500/15 text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">
                        <ShieldAlert size={10} /> Admin
                      </span>
                    )}
                    {!user.isActive && (
                      <span className="bg-slate-500/15 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">
                        Neaktivan
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs font-medium truncate">{user.email}</p>
                  <p className="text-slate-600 text-[10px] font-bold mt-0.5">
                    Registrovan: {new Date(user.createdAt).toLocaleDateString("sr-RS")}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Plan toggle */}
                <button
                  onClick={() =>
                    updateUser(user.id, {
                      plan: user.plan === "FREE" ? "PREMIUM" : "FREE",
                    })
                  }
                  className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all ${
                    user.plan === "PREMIUM"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "glass-card text-slate-500 hover:text-white"
                  }`}
                >
                  {user.plan}
                </button>

                {/* Active toggle */}
                <button
                  onClick={() =>
                    updateUser(user.id, { isActive: !user.isActive })
                  }
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    user.isActive
                      ? "bg-emerald-500/30 border border-emerald-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                      user.isActive
                        ? "translate-x-5.5 bg-emerald-400"
                        : "translate-x-0.5 bg-slate-500"
                    }`}
                    style={{ transform: user.isActive ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
              <div className="text-[11px]">
                <span className="text-white font-black">{user._count.searchHistory}</span>
                <span className="text-slate-600 ml-1.5 font-medium">pretraga</span>
              </div>
              <div className="text-[11px]">
                <span className="text-white font-black">{user._count.savedAnalyses}</span>
                <span className="text-slate-600 ml-1.5 font-medium">sačuvano</span>
              </div>
              <div className="text-[11px]">
                <span className="text-white font-black">{user._count.apiUsage}</span>
                <span className="text-slate-600 ml-1.5 font-medium">API poziva</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm">Nema rezultata za &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
