"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-8 transition-colors"
        >
          <ChevronLeft size={16} /> Nazad na početnu
        </Link>
        {children}
        <footer className="mt-16 pt-8 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
          <p>
            Kreirao{" "}
            <a href="https://impulsee.cloud" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              IMPULSE
            </a>{" "}
            part of{" "}
            <a href="https://impuls-tech.rs" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              IMPULS TECH DOO
            </a>
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/uslovi" className="hover:text-indigo-400 transition-colors">Uslovi korišćenja</Link>
            <Link href="/privatnost" className="hover:text-indigo-400 transition-colors">Politika privatnosti</Link>
            <Link href="/o-nama" className="hover:text-indigo-400 transition-colors">O nama</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
