"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Target, ArrowRight, Search } from "lucide-react";

export default function ComparePage() {
  const router = useRouter();

  return (
    <main className="flex-1 px-6 md:px-10 pb-32 pt-20">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black italic tracking-tighter">Uporedna Analiza</h2>
        </div>

        {/* Placeholder - will be connected when we have real comparison data */}
        <div className="text-center pt-16 animate-fade-in">
          <Target size={64} className="text-indigo-500/20 mx-auto mb-6" />
          <h2 className="text-2xl font-black italic tracking-tighter text-white mb-3">
            Uporedi dva smeštaja
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto mb-8">
            Pretraži i otvori detalje smeštaja, pa koristi dugme &quot;Uporedi Analizu&quot; da vidiš detaljno poređenje.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Search size={18} /> Pretraži smeštaj <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
