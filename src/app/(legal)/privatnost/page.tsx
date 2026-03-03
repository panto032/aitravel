export default function PrivatnostPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black italic tracking-tighter mb-2">Politika privatnosti</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">Poslednje ažuriranje: 3. mart 2026.</p>

      <p>
        IMPULS TECH DOO (u daljem tekstu: &quot;Operater&quot;, &quot;mi&quot;) posvećuje posebnu pažnju
        zaštiti ličnih podataka korisnika platforme TravelAI (u daljem tekstu: &quot;Platforma&quot;).
        Ova Politika privatnosti objašnjava koje podatke prikupljamo, kako ih koristimo i koja su vaša prava.
      </p>

      <h2>1. Rukovalac podataka</h2>
      <ul>
        <li><strong>IMPULS TECH DOO</strong></li>
        <li>Adresa: Lučani 32240, Republika Srbija</li>
        <li>Email: <a href="mailto:info@impuls-tech.com">info@impuls-tech.com</a></li>
        <li>Telefon: +381 60 033 3450</li>
      </ul>

      <h2>2. Podaci koje prikupljamo</h2>

      <h3>2.1 Podaci pri registraciji</h3>
      <ul>
        <li>Ime i prezime (opciono)</li>
        <li>Email adresa</li>
        <li>Lozinka (čuva se u hashiranom obliku — ne možemo je videti)</li>
      </ul>

      <h3>2.2 Podaci o korišćenju</h3>
      <ul>
        <li>Pretrage koje ste izvršili (destinacije, hoteli)</li>
        <li>Analize koje ste sačuvali</li>
        <li>AI feedback koji ste ostavili (tačno/netačno ocene)</li>
        <li>Broj pretraga i analiza mesečno</li>
      </ul>

      <h3>2.3 Tehnički podaci</h3>
      <ul>
        <li>IP adresa</li>
        <li>Tip pregledača (browser) i operativni sistem</li>
        <li>Datum i vreme pristupa</li>
        <li>Kolačići za održavanje sesije</li>
      </ul>

      <h3>2.4 Podaci o plaćanju</h3>
      <ul>
        <li>Mi <strong>ne prikupljamo i ne čuvamo</strong> podatke o vašim platnim karticama.</li>
        <li>Plaćanje se obrađuje putem sertifikovanog platnog procesora koji je u skladu sa PCI DSS standardom.</li>
        <li>Čuvamo samo informaciju o statusu pretplate (aktivan/neaktivan) i datumu transakcije.</li>
      </ul>

      <h2>3. Svrha obrade podataka</h2>
      <p>Vaše podatke koristimo za:</p>
      <ul>
        <li>Pružanje i poboljšanje usluga Platforme</li>
        <li>Autentifikaciju i održavanje korisničkog naloga</li>
        <li>Obradu plaćanja Premium pretplate</li>
        <li>Komunikaciju u vezi sa nalogom (promena uslova, bezbednost)</li>
        <li>Anonimizovanu statistiku korišćenja (ukupan broj pretraga, analiza itd.)</li>
        <li>Poboljšanje AI modela na osnovu anonimizovanog feedback-a</li>
      </ul>

      <h2>4. Pravni osnov za obradu</h2>
      <ul>
        <li><strong>Izvršenje ugovora</strong> — obrada je neophodna za pružanje usluge za koju ste se registrovali.</li>
        <li><strong>Legitimni interes</strong> — poboljšanje Platforme i bezbednost sistema.</li>
        <li><strong>Zakonska obaveza</strong> — čuvanje podataka o transakcijama u skladu sa poreskim propisima.</li>
      </ul>

      <h2>5. Deljenje podataka sa trećim stranama</h2>
      <p>Vaše podatke delimo isključivo u sledećim slučajevima:</p>
      <ul>
        <li><strong>AI provajderi</strong> (Anthropic, Google): Tekst vaših pretraga se prosleđuje AI servisima radi obrade. Ovi provajderi ne čuvaju vaše lične podatke.</li>
        <li><strong>Platni procesor</strong>: Za obradu plaćanja Premium pretplate.</li>
        <li><strong>Hosting provajder</strong>: Server na kome se Platforma nalazi.</li>
        <li><strong>Zakonska obaveza</strong>: Ako to zahteva sud ili nadležni organ Republike Srbije.</li>
      </ul>
      <p>
        Ne prodajemo, ne iznajmljujemo i ne ustupamo vaše lične podatke trećim licima u marketinške svrhe.
      </p>

      <h2>6. Kolačići (cookies)</h2>
      <p>Koristimo sledeće kolačiće:</p>
      <ul>
        <li><strong>Neophodni kolačići</strong>: Za održavanje sesije i autentifikaciju (next-auth.session-token). Bez ovih kolačića Platforma ne može da funkcioniše.</li>
        <li><strong>Kolačići za podešavanja</strong>: Čuvanje izbora teme (svetla/tamna) u localStorage pregledača.</li>
      </ul>
      <p>Ne koristimo kolačiće za praćenje, analitiku ili oglašavanje.</p>

      <h2>7. Čuvanje podataka</h2>
      <ul>
        <li><strong>Podaci naloga</strong>: Čuvaju se dok nalog postoji. Brisanjem naloga brišu se svi vaši podaci.</li>
        <li><strong>Podaci o transakcijama</strong>: Čuvaju se 5 godina u skladu sa zakonskim obavezama.</li>
        <li><strong>Keširani podaci o hotelima</strong>: AI analize se čuvaju do 30 dana radi performansi.</li>
        <li><strong>Offline keš</strong>: Podaci keširani na vašem uređaju (IndexedDB) ostaju pod vašom kontrolom.</li>
      </ul>

      <h2>8. Vaša prava</h2>
      <p>U skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije, imate pravo na:</p>
      <ul>
        <li><strong>Pristup</strong> — uvid u podatke koje čuvamo o vama.</li>
        <li><strong>Ispravku</strong> — izmenu netačnih podataka (dostupno u Profilu).</li>
        <li><strong>Brisanje</strong> — zahtev za brisanje svih vaših podataka.</li>
        <li><strong>Ograničenje obrade</strong> — zahtev za privremeno zaustavljanje obrade.</li>
        <li><strong>Prenosivost</strong> — pravo da dobijete kopiju svojih podataka u strukturiranom formatu.</li>
        <li><strong>Prigovor</strong> — pravo na prigovor Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti.</li>
      </ul>
      <p>
        Za ostvarivanje ovih prava, kontaktirajte nas na{" "}
        <a href="mailto:info@impuls-tech.com">info@impuls-tech.com</a>.
        Odgovorićemo u roku od 30 dana.
      </p>

      <h2>9. Bezbednost podataka</h2>
      <p>Primenjujemo sledeće mere zaštite:</p>
      <ul>
        <li>SSL/TLS enkripcija saobraćaja (HTTPS)</li>
        <li>Lozinke se čuvaju u hashiranom obliku (bcrypt)</li>
        <li>JWT tokeni za autentifikaciju sa ograničenim rokom trajanja</li>
        <li>Pristup bazi podataka ograničen na serversku infrastrukturu</li>
        <li>Redovno ažuriranje softverskih komponenti</li>
      </ul>

      <h2>10. Maloletni korisnici</h2>
      <p>
        Platforma nije namenjena licima mlađim od 16 godina. Ako saznamo da smo prikupili
        podatke maloletnog lica bez saglasnosti roditelja ili staratelja, obrisaćemo te podatke.
      </p>

      <h2>11. Izmene politike privatnosti</h2>
      <p>
        Zadržavamo pravo na izmenu ove Politike privatnosti. O značajnim izmenama ćete biti
        obavešteni putem email-a ili obaveštenja na Platformi.
      </p>

      <h2>12. Kontakt</h2>
      <p>
        Za sva pitanja o zaštiti vaših podataka:
      </p>
      <ul>
        <li><strong>IMPULS TECH DOO</strong></li>
        <li>Adresa: Lučani 32240, Republika Srbija</li>
        <li>Email: <a href="mailto:info@impuls-tech.com">info@impuls-tech.com</a></li>
        <li>Telefon: +381 60 033 3450</li>
      </ul>
    </article>
  );
}
