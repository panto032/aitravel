"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, User, Mail, Shield, Crown, Search,
  BarChart3, Star, LogOut, Lock, Check, X, Loader2, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  stats: {
    totalSearches: number;
    totalAnalyses: number;
    savedAnalyses: number;
    monthlyUsage: number;
    monthlyLimit: number;
  };
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="glass-card p-6 rounded-[28px] mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {theme === "dark" ? (
          <Moon size={20} className="text-indigo-400" />
        ) : (
          <Sun size={20} className="text-amber-400" />
        )}
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {theme === "dark" ? "Tamna tema" : "Svetla tema"}
          </h3>
          <p className="text-[10px] text-[var(--text-secondary)]">
            Prebaci na {theme === "dark" ? "svetlu" : "tamnu"} temu
          </p>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className={`w-14 h-8 rounded-full relative transition-all ${
          theme === "dark"
            ? "bg-indigo-600"
            : "bg-amber-400"
        }`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-md ${
            theme === "dark" ? "left-1" : "left-7"
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // Password state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setEditName(data.name || "");
        setEditEmail(data.email || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setEditMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((p) => (p ? { ...p, name: data.name, email: data.email } : p));
        setEditing(false);
        setEditMsg("Profil ažuriran!");
      } else {
        const err = await res.json();
        setEditMsg(err.error || "Greška");
      }
    } catch {
      setEditMsg("Greška pri čuvanju");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    setPasswordMsg("");
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg("Lozinka promenjena!");
        setCurrentPassword("");
        setNewPassword("");
        setShowPassword(false);
      } else {
        setPasswordMsg(data.error || "Greška");
      }
    } catch {
      setPasswordMsg("Greška pri promeni");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
        <div className="flex justify-center pt-20">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
      <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black italic tracking-tighter">Moj Profil</h1>
        </div>

        {/* Avatar + Info */}
        <div className="glass-card p-8 rounded-[35px] mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {profile?.name || "Korisnik"}
            </h2>
            <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  profile?.plan === "PREMIUM"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                }`}
              >
                {profile?.plan === "PREMIUM" ? "Premium" : "Free"}
              </span>
              {profile?.role === "ADMIN" && (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        {profile?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="glass-card p-4 rounded-[20px] text-center">
              <Search size={18} className="text-indigo-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">{profile.stats.totalSearches}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Pretrage</div>
            </div>
            <div className="glass-card p-4 rounded-[20px] text-center">
              <BarChart3 size={18} className="text-emerald-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">{profile.stats.totalAnalyses}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Analize</div>
            </div>
            <div className="glass-card p-4 rounded-[20px] text-center">
              <Star size={18} className="text-amber-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">{profile.stats.savedAnalyses}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Sačuvano</div>
            </div>
            <div className="glass-card p-4 rounded-[20px] text-center">
              <Shield size={18} className="text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">
                {profile.stats.monthlyLimit === -1
                  ? "∞"
                  : `${profile.stats.monthlyUsage}/${profile.stats.monthlyLimit}`}
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Mesečno</div>
            </div>
          </div>
        )}

        {/* Edit Profile */}
        <div className="glass-card p-6 rounded-[28px] mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User size={16} /> Podaci
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
              >
                Izmeni
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Ime
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-indigo-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-indigo-500/50 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Sačuvaj
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditName(profile?.name || "");
                    setEditEmail(profile?.email || "");
                  }}
                  className="flex items-center gap-2 glass-card hover:bg-white/10 text-slate-400 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  <X size={16} /> Otkaži
                </button>
              </div>
              {editMsg && (
                <p className={`text-sm font-medium ${editMsg.includes("Greška") || editMsg.includes("upotrebi") ? "text-rose-400" : "text-emerald-400"}`}>
                  {editMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-600" />
                <span className="text-white text-sm font-medium">
                  {profile?.name || "Nije postavljeno"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-600" />
                <span className="text-white text-sm font-medium">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Crown size={16} className="text-slate-600" />
                <span className="text-white text-sm font-medium">
                  Član od {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("sr-RS") : ""}
                </span>
              </div>
              {editMsg && (
                <p className="text-sm font-medium text-emerald-400">{editMsg}</p>
              )}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="glass-card p-6 rounded-[28px] mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Lock size={16} /> Lozinka
            </h3>
            {!showPassword && (
              <button
                onClick={() => setShowPassword(true)}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
              >
                Promeni
              </button>
            )}
          </div>

          {showPassword ? (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Trenutna lozinka"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-indigo-500/50 outline-none placeholder:text-slate-700"
              />
              <input
                type="password"
                placeholder="Nova lozinka (min 6 karaktera)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-indigo-500/50 outline-none placeholder:text-slate-700"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !currentPassword || newPassword.length < 6}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Promeni
                </button>
                <button
                  onClick={() => {
                    setShowPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setPasswordMsg("");
                  }}
                  className="flex items-center gap-2 glass-card hover:bg-white/10 text-slate-400 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  <X size={16} /> Otkaži
                </button>
              </div>
              {passwordMsg && (
                <p className={`text-sm font-medium ${passwordMsg.includes("promenjena") ? "text-emerald-400" : "text-rose-400"}`}>
                  {passwordMsg}
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-600 text-sm">••••••••</p>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full glass-card p-5 rounded-[28px] flex items-center justify-center gap-3 text-rose-400 hover:bg-rose-500/10 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Odjavi se</span>
        </button>
      </div>
    </main>
  );
}
