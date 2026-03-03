import Link from "next/link";

export default function ONamaPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black italic tracking-tighter mb-2">O nama</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">TravelAI — Putuj bez maski.</p>

      <h2>O platformi</h2>
      <p>
        TravelAI je prva platforma u regionu koja koristi naprednu veštačku inteligenciju za analizu
        hiljada recenzija smeštajnih objekata. Naš cilj je jednostavan — da vam pružimo iskrenu,
        nepristrasnu sliku o hotelu pre nego što rezervišete i platite.
      </p>
      <p>
        Kombinujemo snagu više AI agenata (Claude, Gemini) sa verifikovanim podacima iz Google Places
        kako bismo analizirali sve dostupne recenzije, detektovali trendove, identifikovali slabosti
        i predložili pametne alternative u blizini.
      </p>

      <h2>Kako radimo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="glass-card p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-indigo-400 mb-2">1. Pretraga</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            AI agent pronalazi hotele i verifikuje ih sa Google Places — pravim slikama, ocenama i lokacijama.
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-emerald-400 mb-2">2. Analiza recenzija</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Gemini AI čita sve recenzije na više jezika i izvlači ocene po kategorijama, citete i trendove.
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-purple-400 mb-2">3. Cross-referenca</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Claude AI povezuje slabosti hotela sa rešenjima u blizini — loš doručak? Odličan restoran na 200m.
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-amber-400 mb-2">4. Izveštaj</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Dobijate detaljan izveštaj sa ocenama, prednostima, manama, tajnim savetima i preporukama.
          </p>
        </div>
      </div>

      <h2>Kompanija</h2>
      <p>
        Platformu TravelAI razvija i njome upravlja <strong>IMPULS TECH DOO</strong>, kompanija
        registrovana u Republici Srbiji, specijalizovana za razvoj digitalnih proizvoda i veb aplikacija.
      </p>

      <div className="glass-card p-6 rounded-2xl my-6">
        <h3 className="text-lg font-bold mb-4">Podaci o pravnom licu</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Pun naziv</td>
              <td className="py-3">IMPULS TECH DOO</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Sedište</td>
              <td className="py-3">Lučani 32240, Republika Srbija</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">PIB</td>
              <td className="py-3">111029989</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Matični broj</td>
              <td className="py-3">21416061</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Godina osnivanja</td>
              <td className="py-3">2019</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Delatnost</td>
              <td className="py-3">Razvoj softvera, digitalne usluge</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Email</td>
              <td className="py-3"><a href="mailto:info@impuls-tech.com" className="text-indigo-400 hover:underline">info@impuls-tech.com</a></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--text-secondary)]">Telefon</td>
              <td className="py-3"><a href="tel:+381600333450" className="text-indigo-400 hover:underline">+381 60 033 3450</a></td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-[var(--text-secondary)]">Radno vreme</td>
              <td className="py-3">Ponedeljak — Petak, 09:00–17:00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Brend</h2>
      <p>
        TravelAI je proizvod{" "}
        <a href="https://impulsee.cloud" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
          IMPULSE
        </a>{" "}
        digitalne agencije, koja je deo pravnog lica{" "}
        <a href="https://impuls-tech.rs" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
          IMPULS TECH DOO
        </a>.
      </p>
      <p>
        IMPULSE se specijalizuje za razvoj modernih web aplikacija, e-commerce rešenja i digitalnih
        proizvoda koristeći najnovije tehnologije: React, Next.js, Node.js, TypeScript i TailwindCSS.
      </p>

      <h2>Kontakt</h2>
      <p>
        Za sva pitanja, sugestije ili primedbe u vezi sa platformom TravelAI:
      </p>
      <ul>
        <li>Email: <a href="mailto:info@impuls-tech.com" className="text-indigo-400 hover:underline">info@impuls-tech.com</a></li>
        <li>Telefon: <a href="tel:+381600333450" className="text-indigo-400 hover:underline">+381 60 033 3450</a></li>
        <li>Web: <a href="https://impulsee.cloud" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">impulsee.cloud</a></li>
      </ul>

      <div className="mt-8 text-center">
        <Link
          href="/register"
          className="inline-flex h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest items-center justify-center gap-3 px-8 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
        >
          Kreiraj besplatan nalog
        </Link>
      </div>
    </article>
  );
}
