# AITravel

## Opis projekta
AI turistički vodič koji analizira hiljade recenzija pomoću multi-AI pipeline-a (Claude Haiku + Google Places + Gemini 2.5 Flash + Claude Sonnet) da pokaže šta se stvarno dešava u hotelu.

**Motto:** "Putuj bez maski."

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- PostgreSQL + Prisma ORM
- AI: Claude Haiku/Sonnet, Google Gemini 2.5 Flash
- Data: Google Places API (New)
- Auth: NextAuth v5 (JWT)
- Maps: MapLibre GL (placeholder, full integration pending)
- Offline: IndexedDB (idb)

## Gde smo stali
- Kompletna nadogradnja implementirana (Faze 1-14)
- `npm run build` prolazi bez grešaka

## Šta je urađeno
- Multi-AI pipeline: Haiku → Google Places → Gemini → Sonnet
- Google Places: prave slike, recenzije, rating, koordinate
- Gemini: bulk analiza recenzija sa multijezičnim sentiment-om
- Landing page: 8 sekcija, showcase iz keša, mini-preview modal
- Korisnički panel: profil, lozinka, statistika
- Compare stranica: side-by-side poređenje sačuvanih hotela
- AI Feedback: thumbs up/down po kategoriji
- Light/Dark tema sistem (CSS varijable + ThemeProvider)
- PWA offline: IndexedDB keširanje analiza i pretraga
- Offline banner i smart fetch wrapper
- Admin: cost breakdown po provajderu + feedback stats
- Search: Google slike, rating badge, verified badge, map view toggle
- Hotel detail: photo galerija, trend indikatori, sample quotes, feedback

## Env varijable (potrebne)
- ANTHROPIC_API_KEY
- GOOGLE_PLACES_API_KEY
- GEMINI_API_KEY
- DATABASE_URL, AUTH_SECRET
