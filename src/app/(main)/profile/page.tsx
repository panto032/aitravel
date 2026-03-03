"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Shield, Crown, Search, BarChart3, Star, LogOut,
  Lock, Check, X, Loader2, Moon, Sun, Database, CreditCard,
  Bell, ArrowRight, Sparkles,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { FooterSignature } from "@/components/ui/FooterSignature";

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

/* ─── Reusable Sub-components ─── */

function StatBox({
  val,
  label,
  icon,
  isDark,
}: {
  val: string;
  label: string;
  icon: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div className="glass-card p-5 md:p-6 rounded-[30px] text-center bento-hover">
      <div className={`mx-auto mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-black italic text-gradient leading-none mb-1.5 tracking-tighter">
        {val}
      </div>
      <span
        className={`text-[8px] font-black uppercase tracking-widest italic leading-none ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function MenuLink({
  icon,
  label,
  value,
  right,
  highlight,
  onClick,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  right?: React.ReactNode;
  highlight?: boolean;
  onClick?: () => void;
  isDark: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-7 md:px-8 py-5 last:border-none transition-all cursor-pointer group ${
        isDark
          ? "border-b border-white/5 hover:bg-white/[0.03]"
          : "border-b border-black/5 hover:bg-black/[0.02]"
      }`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`transition-colors ${
            isDark
              ? "text-slate-500 group-hover:text-indigo-400"
              : "text-slate-400 group-hover:text-indigo-600"
          }`}
        >
          {icon}
        </div>
        <span
          className={`text-[13px] font-bold italic uppercase tracking-tight ${
            highlight
              ? "text-indigo-400"
              : isDark
              ? "text-slate-300"
              : "text-slate-700"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {value && (
          <span
            className={`text-[10px] font-black italic uppercase ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {value}
          </span>
        )}
        {right ? (
          right
        ) : (
          <ArrowRight
            size={14}
            className={`transition-all ${
              isDark
                ? "text-slate-700 group-hover:text-indigo-500"
                : "text-slate-300 group-hover:text-indigo-500"
            }`}
          />
        )}
      </div>
    </div>
  );
}

function InlineThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${
        isDark ? "bg-indigo-600" : "bg-amber-400"
      }`}
    >
      <div
        className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all shadow-md ${
          isDark ? "left-[3px]" : "left-[27px]"
        }`}
      />
    </div>
  );
}

/* ─── Main Page ─── */

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <main className="flex-1 px-6 md:px-10 pb-32 pt-10">
        <div className="max-w-[640px] mx-auto">
          <PageHeader label="Moj Profil" />
          <div className="flex justify-center pt-20">
            <div className="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  const initials =
    (session?.user?.name || profile?.name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const planLabel =
    profile?.plan === "PREMIUM"
      ? `Premium Plan`
      : `Free Plan`;

  const usageLabel =
    profile?.stats
      ? profile.stats.monthlyLimit === -1
        ? `${profile.stats.monthlyUsage} Analiza`
        : `${profile.stats.monthlyUsage}/${profile.stats.monthlyLimit} Analiza`
      : "";

  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-4 md:pt-6 relative overflow-hidden">
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

      <div className="max-w-[640px] mx-auto w-full relative z-10 animate-fade-in-up">
        {/* PageHeader */}
        <PageHeader label="Moj Profil" />

        {/* ─── Profile Identity Section ─── */}
        <div className="text-center mb-14">
          {/* Rotated Gradient Avatar */}
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[35px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[3px] shadow-2xl rotate-3">
              <div
                className={`w-full h-full rounded-[32px] flex items-center justify-center text-3xl md:text-4xl font-black text-white italic ${
                  isDark ? "bg-[#020205]" : "bg-slate-50"
                }`}
              >
                {initials}
              </div>
            </div>
            {/* Badge */}
            <div
              className={`absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ${
                isDark ? "border-4 border-[#020205]" : "border-4 border-slate-50"
              }`}
            >
              <Sparkles size={16} className="text-white" />
            </div>
          </div>

          {/* Name */}
          <h1
            className={`text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {profile?.name || "Korisnik"}
          </h1>

          {/* Email */}
          <p
            className={`font-bold text-xs uppercase tracking-widest mb-6 italic ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {profile?.email}
          </p>

          {/* Plan / Usage Badge */}
          <div className="inline-flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full shadow-lg ${
                profile?.plan === "PREMIUM"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-emerald-500/10 border border-emerald-500/20"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  profile?.plan === "PREMIUM" ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${
                  profile?.plan === "PREMIUM" ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {planLabel} {usageLabel ? `\u2022 ${usageLabel}` : ""}
              </span>
            </div>

            {profile?.role === "ADMIN" && (
              <span className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* ─── Stats Grid — Bento Style ─── */}
        {profile?.stats && (
          <div className="grid grid-cols-3 gap-3 mb-12">
            <StatBox
              val={String(profile.stats.totalSearches)}
              label="Istrage"
              icon={<Search size={16} />}
              isDark={isDark}
            />
            <StatBox
              val={String(profile.stats.totalAnalyses)}
              label="Dosijea"
              icon={<BarChart3 size={16} />}
              isDark={isDark}
            />
            <StatBox
              val={String(profile.stats.savedAnalyses)}
              label="Sačuvano"
              icon={<Star size={16} />}
              isDark={isDark}
            />
          </div>
        )}

        {/* ─── Account Details Form ─── */}
        <div className="space-y-10 mb-14">
          {/* Edit Profile Section */}
          <div>
            <div className="flex items-center justify-between mb-5 px-2">
              <h3
                className={`text-[10px] font-black uppercase tracking-[0.4em] italic ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Podaci Naloga
              </h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors italic cursor-pointer"
                >
                  Izmeni
                </button>
              )}
            </div>

            <div className="glass-card p-7 md:p-8 rounded-[35px]">
              {editing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      className={`text-[9px] font-black uppercase tracking-widest ml-1 italic ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Puno Ime
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-4 input-glass font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-[9px] font-black uppercase tracking-widest ml-1 italic ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      E-mail Adresa
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-5 py-4 input-glass font-bold text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Sačuvaj
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditName(profile?.name || "");
                        setEditEmail(profile?.email || "");
                        setEditMsg("");
                      }}
                      className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                        isDark
                          ? "border border-white/10 text-slate-400 hover:border-white/20"
                          : "border border-black/10 text-slate-500 hover:border-black/20"
                      }`}
                    >
                      <X size={14} /> Otkaži
                    </button>
                  </div>
                  {editMsg && (
                    <p
                      className={`text-xs font-bold italic ${
                        editMsg.includes("Greška") || editMsg.includes("upotrebi")
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {editMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <User
                      size={16}
                      className={isDark ? "text-slate-600" : "text-slate-400"}
                    />
                    <span
                      className={`text-sm font-bold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {profile?.name || "Nije postavljeno"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail
                      size={16}
                      className={isDark ? "text-slate-600" : "text-slate-400"}
                    />
                    <span
                      className={`text-sm font-bold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {profile?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Crown
                      size={16}
                      className={isDark ? "text-slate-600" : "text-slate-400"}
                    />
                    <span
                      className={`text-sm font-bold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      Član od{" "}
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("sr-RS")
                        : ""}
                    </span>
                  </div>
                  {editMsg && (
                    <p className="text-xs font-bold italic text-emerald-400">
                      {editMsg}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── Password Section ─── */}
          <div>
            <div className="flex items-center justify-between mb-5 px-2">
              <h3
                className={`text-[10px] font-black uppercase tracking-[0.4em] italic ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Sigurnost
              </h3>
              {!showPassword && (
                <button
                  onClick={() => setShowPassword(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors italic cursor-pointer"
                >
                  Promeni
                </button>
              )}
            </div>

            <div className="glass-card p-7 md:p-8 rounded-[35px]">
              {showPassword ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      className={`text-[9px] font-black uppercase tracking-widest ml-1 italic ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Trenutna Lozinka
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-5 py-4 input-glass font-bold text-sm"
                      />
                      <Lock
                        size={16}
                        className={`absolute right-5 top-1/2 -translate-y-1/2 ${
                          isDark ? "text-slate-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-[9px] font-black uppercase tracking-widest ml-1 italic ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Nova Lozinka
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Min 6 karaktera"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-5 py-4 input-glass font-bold text-sm"
                      />
                      <Lock
                        size={16}
                        className={`absolute right-5 top-1/2 -translate-y-1/2 ${
                          isDark ? "text-slate-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={
                        changingPassword ||
                        !currentPassword ||
                        newPassword.length < 6
                      }
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all cursor-pointer"
                    >
                      {changingPassword ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Promeni
                    </button>
                    <button
                      onClick={() => {
                        setShowPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setPasswordMsg("");
                      }}
                      className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                        isDark
                          ? "border border-white/10 text-slate-400 hover:border-white/20"
                          : "border border-black/10 text-slate-500 hover:border-black/20"
                      }`}
                    >
                      <X size={14} /> Otkaži
                    </button>
                  </div>
                  {passwordMsg && (
                    <p
                      className={`text-xs font-bold italic ${
                        passwordMsg.includes("promenjena")
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {passwordMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Lock
                    size={16}
                    className={isDark ? "text-slate-600" : "text-slate-400"}
                  />
                  <span
                    className={`text-sm font-bold ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    ••••••••
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Settings Menu ─── */}
          <div>
            <h3
              className={`text-[10px] font-black uppercase tracking-[0.4em] italic mb-5 px-2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Sistemska Podešavanja
            </h3>
            <div className="glass-card rounded-[35px] overflow-hidden">
              <MenuLink
                icon={<Moon size={18} />}
                label="Tamna tema"
                right={
                  <InlineThemeToggle isDark={isDark} onToggle={toggleTheme} />
                }
                isDark={isDark}
              />
              <MenuLink
                icon={<Database size={18} />}
                label="Offline keš"
                value="Lokalno"
                isDark={isDark}
              />
              <MenuLink
                icon={<CreditCard size={18} />}
                label="Premium plan"
                value={
                  profile?.plan === "PREMIUM" ? "Aktivan" : "Nadogradi"
                }
                highlight
                isDark={isDark}
              />
              <MenuLink
                icon={<Bell size={18} />}
                label="Notifikacije"
                value="Uključeno"
                isDark={isDark}
              />
              <MenuLink
                icon={<Shield size={18} />}
                label="Privatnost podataka"
                isDark={isDark}
              />
              {profile?.role === "ADMIN" && (
                <MenuLink
                  icon={<Shield size={18} />}
                  label="Admin panel"
                  highlight
                  onClick={() => router.push("/admin")}
                  isDark={isDark}
                />
              )}
            </div>
          </div>
        </div>

        {/* ─── Logout Button ─── */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`w-full glass-card py-6 rounded-[30px] text-rose-500 font-black uppercase tracking-[0.3em] text-[11px] italic flex items-center justify-center gap-4 transition-all mb-14 cursor-pointer ${
            isDark
              ? "border-rose-500/10 hover:bg-rose-500/5 hover:border-rose-500/30"
              : "border-rose-500/10 hover:bg-rose-500/5 hover:border-rose-500/20"
          }`}
        >
          <LogOut size={18} /> Odjavi se sa sistema
        </button>

        {/* ─── Footer Signature ─── */}
        <FooterSignature />
      </div>
    </main>
  );
}
