"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Lozinke se ne poklapaju");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška pri registraciji");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const fields = [
    { label: "Ime", type: "text", placeholder: "Vaše ime", value: name, set: setName },
    { label: "Email", type: "email", placeholder: "vas@email.com", value: email, set: setEmail },
    { label: "Lozinka", type: "password", placeholder: "Najmanje 6 karaktera", value: password, set: setPassword },
    { label: "Potvrdi lozinku", type: "password", placeholder: "Ponovite lozinku", value: confirmPassword, set: setConfirmPassword },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.label}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            {f.label}
          </label>
          <input
            type={f.type}
            placeholder={f.placeholder}
            className="w-full glass-card rounded-2xl px-5 py-4 text-white placeholder-slate-700 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            required
          />
        </div>
      ))}

      {error && (
        <div className="glass-card border-danger/20 bg-danger/5 rounded-2xl px-5 py-3 text-sm text-danger font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Kreiraj nalog <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#020205] px-4 text-[10px] font-black uppercase tracking-widest text-slate-600">ili</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-14 glass-card rounded-2xl font-bold text-sm text-slate-400 flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Nastavi sa Google
      </button>
    </form>
  );
}
