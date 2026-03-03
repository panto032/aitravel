// Gemini 2.5 Flash — bulk review analysis with multilingual sentiment
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.5-flash";

export interface GeminiAnalysis {
  scores: {
    category: string;
    score: number;
    mentionCount: number;
    trend: "improving" | "stable" | "declining";
    positiveQuotes: string[];
    negativeQuotes: string[];
  }[];
  overallScore: number;
  totalReviewsAnalyzed: number;
  languageBreakdown: { language: string; count: number; flag: string }[];
  weaknesses: { category: string; severity: number; detail: string }[];
  strengths: { category: string; detail: string }[];
  reviewBombing: boolean;
  reviewBombingDetail?: string;
}

export interface ReviewInput {
  text: string;
  rating: number;
  language?: string;
  date?: string;
  author?: string;
}

export interface NearbyInput {
  name: string;
  type: string;
  rating?: number;
  distance?: string;
  reviewCount?: number;
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Bulk analyze all reviews for a hotel using Gemini 2.5 Flash
 * Includes multilingual sentiment analysis with sarcasm detection
 */
export async function analyzeReviewsBulk(
  hotelName: string,
  reviews: ReviewInput[],
  nearbyPlaces: NearbyInput[] = []
): Promise<GeminiAnalysis | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  if (reviews.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const reviewsText = reviews
    .map(
      (r, i) =>
        `[${i + 1}] Rating: ${r.rating}/5 | ${r.language || "unknown"} | ${r.date || "unknown"}\n${r.text}`
    )
    .join("\n---\n");

  const nearbyText =
    nearbyPlaces.length > 0
      ? nearbyPlaces
          .map(
            (p) =>
              `- ${p.name} (${p.type}) — rating: ${p.rating || "N/A"}, ${p.distance || "nearby"}, ${p.reviewCount || 0} reviews`
          )
          .join("\n")
      : "Nema podataka o obližnjim mestima.";

  const prompt = `Ti si AI ekspert za analizu hotelskih recenzija. Analiziraj SVE recenzije za hotel "${hotelName}".

RECENZIJE (${reviews.length} ukupno):
${reviewsText}

OBLIŽNJA MESTA:
${nearbyText}

INSTRUKCIJE ZA ANALIZU:

1. KATEGORIJE — oceni svaku od 1-10 na osnovu mention-a u recenzijama:
   - Lokacija (blizina plaže, centra, pristupačnost)
   - Čistoća (sobe, kupatilo, zajednički prostor)
   - Osoblje (ljubaznost, jezici, brzina reakcije)
   - Kreveti i sobe (udobnost, oprema, zvučna izolacija)
   - Doručak (kvalitet, raznovrsnost, svežina)
   - WiFi (brzina, stabilnost, pokrivenost)
   - Vrednost za novac (da li je cena opravdana)

2. MULTILINGVALNA ANALIZA:
   - Analiziraj na SVIM jezicima: srpski, engleski, grčki, nemački, turski, itd.
   - SARKAZAM na srpskom/hrvatskom/bošnjačkom:
     * "Doručak je bio baš 'obilan'" + ocena 1-2 → NEGATIVNO (sarkazam)
     * "Sve 'super'" sa navodnicima → SARKAZAM
   - LOKALNI IZRAZI:
     * "katastrofa" = jako loše (1-3)
     * "ekstra" = jako dobro (8-10)
     * "solidan" = prosečno (5-6)
     * "nikakav" = loše (1-3)
     * "bombona" = odlično (9-10)
   - Novije recenzije imaju VEĆU težinu od starijih

3. TREND: za svaku kategoriju odredi "improving", "stable", ili "declining" na osnovu hronologije recenzija

4. REVIEW BOMBING: detektuj nagle promene sentiment-a (npr. 10 negativnih recenzija u 2 dana)

5. SLABOSTI: izdvoji slabosti sa severity 1-10 za cross-referencing sa nearby mestima

Vrati SAMO validan JSON (bez markdown):
{
  "scores": [
    {
      "category": "Lokacija",
      "score": 8.5,
      "mentionCount": 120,
      "trend": "stable",
      "positiveQuotes": ["citat1", "citat2"],
      "negativeQuotes": ["citat1"]
    }
  ],
  "overallScore": 7.5,
  "totalReviewsAnalyzed": ${reviews.length},
  "languageBreakdown": [
    { "language": "Serbian", "count": 50, "flag": "🇷🇸" },
    { "language": "English", "count": 30, "flag": "🇬🇧" }
  ],
  "weaknesses": [
    { "category": "Doručak", "severity": 8, "detail": "opis slabosti" }
  ],
  "strengths": [
    { "category": "Lokacija", "detail": "opis snage" }
  ],
  "reviewBombing": false,
  "reviewBombingDetail": null
}

Budi objektivan. Koristi SAMO informacije iz recenzija. Ne izmišljaj podatke.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || "";

    let result: GeminiAnalysis;
    try {
      result = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Gemini returned invalid JSON:", text.slice(0, 200));
        return null;
      }
    }

    return result;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}

/**
 * Get estimated token count for Gemini pricing
 */
export function estimateGeminiTokens(reviews: ReviewInput[]): number {
  const totalChars = reviews.reduce(
    (sum, r) => sum + (r.text?.length || 0),
    0
  );
  // Rough estimate: 4 chars per token
  return Math.ceil(totalChars / 4) + 2000; // +2000 for prompt
}
