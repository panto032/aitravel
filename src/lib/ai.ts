import Anthropic from "@anthropic-ai/sdk";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Pricing per 1M tokens (USD)
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "claude-sonnet-4-6-20250514": { input: 3.0, output: 15.0 },
};

const SEARCH_MODEL = "claude-haiku-4-5-20251001";
const ANALYZE_MODEL = "claude-sonnet-4-6-20250514";

// Monthly free limit
const FREE_MONTHLY_LIMIT = 10;

// Cache TTL in days
const CACHE_TTL_DAYS = 14;

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

export async function checkUserLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan === "PREMIUM") {
    return { allowed: true, used: 0, limit: -1, plan: "PREMIUM" };
  }

  // Count non-cached requests this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.apiUsage.count({
    where: {
      userId,
      cached: false,
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    allowed: used < FREE_MONTHLY_LIMIT,
    used,
    limit: FREE_MONTHLY_LIMIT,
    plan: "FREE",
  };
}

async function logApiUsage(
  userId: string,
  type: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  query: string,
  cached: boolean
) {
  const costUsd = cached ? 0 : calculateCost(model, inputTokens, outputTokens);

  await prisma.apiUsage.create({
    data: {
      userId,
      type,
      model: cached ? "cache" : model.includes("haiku") ? "haiku" : "sonnet",
      inputTokens: cached ? 0 : inputTokens,
      outputTokens: cached ? 0 : outputTokens,
      costUsd,
      query,
      cached,
    },
  });
}

// ============================================
// TYPES
// ============================================

export interface HotelAnalysis {
  hotelName: string;
  location: string;
  aiScore: number;
  summary: string;
  scores: {
    category: string;
    score: number;
    verdict: "odlicno" | "dobro" | "prosecno" | "lose";
    detail: string;
    mentionCount: number;
  }[];
  pros: string[];
  cons: string[];
  aiTip: string;
  nearby: {
    name: string;
    type: "restaurant" | "beach" | "bar" | "attraction";
    rating: number;
    distance: string;
    detail: string;
  }[];
  priceRange: string;
  bestFor: string[];
  reviewSources: string[];
  totalReviews: number;
}

export interface SearchResult {
  hotelName: string;
  location: string;
  aiScore: number;
  priceRange: string;
  distance: string;
  shortSummary: string;
  pros: string[];
  cons: string[];
  tags: string[];
}

export interface SearchResponse {
  destination: string;
  summary: string;
  results: SearchResult[];
}

// ============================================
// SEARCH - uses Haiku (fast & cheap) + caching
// ============================================

export async function searchDestination(
  query: string,
  userId: string
): Promise<SearchResponse> {
  // Check cache first
  const normalizedQuery = query.trim().toLowerCase();
  const cached = await prisma.searchCache.findUnique({
    where: { query: normalizedQuery },
  });

  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

    if (age < maxAge) {
      await logApiUsage(userId, "search", "cache", 0, 0, query, true);
      return cached.results as unknown as SearchResponse;
    }
  }

  // Check rate limit
  const limit = await checkUserLimit(userId);
  if (!limit.allowed) {
    throw new Error(
      `Dostignut mesecni limit (${limit.used}/${limit.limit}). Nadogradi na Premium za neogranicene pretrage.`
    );
  }

  const message = await anthropic.messages.create({
    model: SEARCH_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Ti si turisticki AI asistent. Korisnik pretrazuje: "${query}"

Vrati JSON sa rezultatima pretrage smestaja. Budi realan i iskren u ocenama.
Za svaki smestaj daj AI score od 1-10 baziran na kvalitetu, recenzijama, vrednosti.

VAZAN FORMAT - vrati SAMO validan JSON bez ikakvih markdown oznaka:
{
  "destination": "naziv destinacije",
  "summary": "kratka AI analiza destinacije - 2-3 recenice, sta treba znati, upozorenja",
  "results": [
    {
      "hotelName": "naziv",
      "location": "tacna lokacija",
      "aiScore": 8.5,
      "priceRange": "€40-70/noc",
      "distance": "150m od plaze",
      "shortSummary": "kratko - 1 recenica sta je dobro i sta je lose",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"],
      "tags": ["blizu plaze", "parking", "wifi"]
    }
  ]
}

Daj 4-6 rezultata. Budi realan - nemoj sve oceniti visoko. Neki hoteli su losi i to treba reci.
Koristi realne nazive hotela i lokacija ako ih znas. Ako ne znas tacne, izmisli realisticne.
Odgovaraj na srpskom jeziku.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let result: SearchResponse;
  try {
    result = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI nije vratio validan odgovor");
    }
  }

  // Log API usage
  await logApiUsage(
    userId,
    "search",
    SEARCH_MODEL,
    message.usage.input_tokens,
    message.usage.output_tokens,
    query,
    false
  );

  // Cache results
  await prisma.searchCache.upsert({
    where: { query: normalizedQuery },
    update: { results: result as unknown as Prisma.InputJsonValue, updatedAt: new Date() },
    create: { query: normalizedQuery, results: result as unknown as Prisma.InputJsonValue },
  });

  // Save search history
  await prisma.searchHistory.create({
    data: { userId, query, results: result as unknown as Prisma.InputJsonValue },
  });

  return result;
}

// ============================================
// ANALYZE - uses Sonnet (quality) + caching
// ============================================

export async function analyzeHotel(
  hotelName: string,
  location: string,
  userId: string
): Promise<HotelAnalysis> {
  // Check hotel cache first
  const cached = await prisma.hotelCache.findUnique({
    where: { name_location: { name: hotelName, location } },
  });

  if (cached?.aiAnalysis) {
    const age = Date.now() - cached.updatedAt.getTime();
    const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

    if (age < maxAge) {
      await logApiUsage(userId, "analyze", "cache", 0, 0, hotelName, true);
      return cached.aiAnalysis as unknown as HotelAnalysis;
    }
  }

  // Check rate limit
  const limit = await checkUserLimit(userId);
  if (!limit.allowed) {
    throw new Error(
      `Dostignut mesecni limit (${limit.used}/${limit.limit}). Nadogradi na Premium za neogranicene pretrage.`
    );
  }

  const message = await anthropic.messages.create({
    model: ANALYZE_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Ti si turisticki AI asistent koji analizira smestaj na osnovu svih dostupnih informacija.

Analiziraj: "${hotelName}" u lokaciji "${location}"

Daj detaljnu, ISKRENU analizu. Ne ulepsavaj. Ako je nesto lose, reci direktno.
Oceni svaku kategoriju od 1-10 i daj verdict: "odlicno", "dobro", "prosecno", ili "lose".

VAZAN FORMAT - vrati SAMO validan JSON bez markdown oznaka:
{
  "hotelName": "${hotelName}",
  "location": "${location}",
  "aiScore": 7.5,
  "summary": "2-3 recenice - generalni utisak, za koga je, da li vredi",
  "scores": [
    {
      "category": "Lokacija",
      "score": 8.5,
      "verdict": "odlicno",
      "detail": "konkretan opis - rastojanja, sta je u blizini",
      "mentionCount": 245
    },
    {
      "category": "Cistoca",
      "score": 7.0,
      "verdict": "dobro",
      "detail": "sta kazu gosti o cistoci",
      "mentionCount": 180
    },
    {
      "category": "Osoblje",
      "score": 8.0,
      "verdict": "dobro",
      "detail": "kakvo je osoblje, da li pricaju jezike",
      "mentionCount": 150
    },
    {
      "category": "Kreveti i sobe",
      "score": 6.0,
      "verdict": "prosecno",
      "detail": "stanje kreveta, namestaja, klimatizacije",
      "mentionCount": 200
    },
    {
      "category": "Dorucak",
      "score": 5.0,
      "verdict": "lose",
      "detail": "kvalitet dorucka, raznovrsnost",
      "mentionCount": 170
    },
    {
      "category": "WiFi",
      "score": 4.0,
      "verdict": "lose",
      "detail": "brzina i pouzdanost interneta",
      "mentionCount": 130
    },
    {
      "category": "Vrednost za novac",
      "score": 7.5,
      "verdict": "dobro",
      "detail": "da li je cena opravdana za ono sto se dobija",
      "mentionCount": 160
    }
  ],
  "pros": ["prednost 1", "prednost 2", "prednost 3"],
  "cons": ["mana 1", "mana 2", "mana 3"],
  "aiTip": "konkretan savet - npr ako je dorucak los, preporuci restoran u blizini sa imenom i cenom",
  "nearby": [
    {
      "name": "naziv mesta",
      "type": "restaurant",
      "rating": 4.5,
      "distance": "400m",
      "detail": "sta nude, prosecna cena"
    }
  ],
  "priceRange": "€40-65/noc",
  "bestFor": ["parovi", "budget putnici"],
  "reviewSources": ["Booking.com", "Google Reviews", "TripAdvisor"],
  "totalReviews": 890
}

Budi realan. Koristi stvarne informacije ako ih znas.
Daj 3-4 nearby preporuke razlicitih tipova.
Odgovaraj na srpskom jeziku.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let result: HotelAnalysis;
  try {
    result = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI nije vratio validan odgovor");
    }
  }

  // Log API usage
  await logApiUsage(
    userId,
    "analyze",
    ANALYZE_MODEL,
    message.usage.input_tokens,
    message.usage.output_tokens,
    hotelName,
    false
  );

  // Cache in HotelCache
  await prisma.hotelCache.upsert({
    where: { name_location: { name: hotelName, location } },
    update: {
      aiAnalysis: result as unknown as Prisma.InputJsonValue,
      aiScore: result.aiScore,
      updatedAt: new Date(),
    },
    create: {
      name: hotelName,
      location,
      aiAnalysis: result as unknown as Prisma.InputJsonValue,
      aiScore: result.aiScore,
      sources: result.reviewSources || [],
    },
  });

  return result;
}
