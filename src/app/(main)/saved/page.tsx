"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Search, ArrowRight } from "lucide-react";

interface SavedItem {
  id: string;
  hotelName: string;
  location: string;
  aiScore: number | null;
  analysis: Record<string, unknown> | null;
  createdAt: string;
}

export default function SavedPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/saved");
      if (res.ok) setItems(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/saved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setItems((prev) => prev.filter((item) => item.id !== id));
    } catch { /* ignore */ }
  };

  const handleClick = (item: SavedItem) => {
    const params = new URLSearchParams({ name: item.hotelName, location: item.location });
    router.push(`/hotel/detail?${params.toString()}`);
  };

  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-black italic tracking-tighter mb-2">Sačuvane Analize</h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">
          {items.length} sačuvanih izveštaja
        </p>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center pt-16 animate-fade-in">
            <Star size={64} className="text-indigo-500/20 mx-auto mb-6" />
            <h2 className="text-2xl font-black italic tracking-tighter text-white mb-3">
              Nemaš sačuvanih analiza
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              Kada pronađeš zanimljiv smeštaj, sačuvaj AI analizu ovde.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Search size={18} /> Pretraži smeštaj
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card p-6 rounded-[35px] flex items-center gap-6 group hover:bg-white/5 transition-all"
              >
                <button onClick={() => handleClick(item)} className="flex-1 text-left flex items-center gap-5">
                  {item.aiScore && (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-lg italic flex-shrink-0">
                      {item.aiScore.toFixed(1)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-base group-hover:text-indigo-400 transition-colors">
                      {item.hotelName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      {item.location} • {new Date(item.createdAt).toLocaleDateString("sr-RS")}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleClick(item)}
                    className="text-slate-600 hover:text-indigo-400 transition-colors"
                  >
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-700 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
