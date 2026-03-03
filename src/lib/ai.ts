import Anthropic from "@anthropic-ai/sdk";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  searchHotels,
  getPlaceDetails,
  getNearbyPlaces,
  getPhotoUrl,
  calculateDistance,
  formatDistance,
  isGooglePlacesConfigured,
  type GooglePlace,
  type GoogleReview,
} from "./google-places";
import {
  analyzeReviewsBulk,
  isGeminiConfigured,
  type ReviewInput,
  type NearbyInput,
  type GeminiAnalysis,
} from "./gemini";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Pricing per 1M tokens (USD)
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
};

const SEARCH_MODEL = "claude-haiku-4-5-20251001";
const ANALYZE_MODEL = "claude-sonnet-4-6";

// Monthly free limit
const FREE_MONTHLY_LIMIT = 10;

// Cache never expires automatically — re-analyze only on explicit user request
// or when AI feedback accuracy drops below threshold

// Daily cost safety limit
const DAILY_COST_LIMIT = 10.0;

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

async function checkDailyCostLimit(): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const result = await prisma.apiUsage.aggregate({
    where: { createdAt: { gte: startOfDay } },
    _sum: { costUsd: true },
  });

  return (result._sum.costUsd || 0) < DAILY_COST_LIMIT;
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
  const costUsd = cached
    ? 0
    : calculateCost(model, inputTokens, outputTokens);

  await prisma.apiUsage.create({
    data: {
      userId,
      type,
      model: cached
        ? "cache"
        : model.includes("haiku")
          ? "haiku"
          : model.includes("sonnet")
            ? "sonnet"
            : model.includes("gemini")
              ? "gemini"
              : model.includes("google")
                ? "google"
                : model,
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
    trend?: "improving" | "stable" | "declining";
    sampleQuote?: string;
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
    crossRef?: string;
    photoUrl?: string;
    reviewCount?: number;
  }[];
  priceRange: string;
  bestFor: string[];
  reviewSources: string[];
  totalReviews: number;
  // New Google-verified fields
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  photos?: string[];
  verified: boolean;
  dataQuality: "full" | "partial" | "ai_only";
  languageBreakdown?: { language: string; count: number; flag: string }[];
  latitude?: number;
  longitude?: number;
  cachedAt?: string; // ISO date when this analysis was created/cached
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
  // New Google-verified fields
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  photoUrl?: string;
  verified: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SearchResponse {
  destination: string;
  summary: string;
  results: SearchResult[];
}

// ============================================
// SEARCH — 2-step: Haiku + Google Places
// ============================================

export async function searchDestination(
  query: string,
  userId: string,
  forceRefresh = false
): Promise<SearchResponse> {
  // Check cache first (permanent — no TTL expiry)
  const normalizedQuery = query.trim().toLowerCase();

  if (!forceRefresh) {
    const cached = await prisma.searchCache.findUnique({
      where: { query: normalizedQuery },
    });

    if (cached) {
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

  // Check daily cost limit
  if (!(await checkDailyCostLimit())) {
    throw new Error("Dnevni limit troškova je dostignut. Pokušaj ponovo sutra.");
  }

  // Step 1: Claude Haiku — suggest hotel names + search term
  const haikuMessage = await anthropic.messages.create({
    model: SEARCH_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Ti si turisticki AI asistent. Korisnik pretrazuje: "${query}"

Predloži 5-8 hotela koje poznaješ za ovu destinaciju, plus optimalan search term za Google Places.

VAZAN FORMAT - vrati SAMO validan JSON bez markdown oznaka:
{
  "destination": "naziv destinacije",
  "summary": "kratka AI analiza destinacije - 2-3 recenice",
  "searchTerm": "hotels in [destination name in English]",
  "suggestedHotels": [
    {
      "hotelName": "naziv",
      "location": "tacna lokacija",
      "aiScore": 8.5,
      "priceRange": "€40-70/noc",
      "distance": "150m od plaze",
      "shortSummary": "kratko - 1 recenica",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"],
      "tags": ["blizu plaze", "parking", "wifi"]
    }
  ]
}

Daj 5-8 rezultata. Budi realan. Koristi realne nazive hotela.
Odgovaraj na srpskom jeziku.`,
      },
    ],
  });

  const haikuText =
    haikuMessage.content[0].type === "text" ? haikuMessage.content[0].text : "";

  let haikuResult: {
    destination: string;
    summary: string;
    searchTerm: string;
    suggestedHotels: SearchResult[];
  };
  try {
    // Strip markdown code fences if present
    const cleaned = haikuText.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    haikuResult = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from text
    const jsonMatch = haikuText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        haikuResult = JSON.parse(jsonMatch[0]);
      } catch {
        // Last resort: try to fix common JSON issues (trailing commas)
        const fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, "}")
          .replace(/,\s*\]/g, "]");
        haikuResult = JSON.parse(fixedJson);
      }
    } else {
      throw new Error("AI nije vratio validan odgovor");
    }
  }

  // Log Haiku usage
  await logApiUsage(
    userId,
    "search",
    SEARCH_MODEL,
    haikuMessage.usage.input_tokens,
    haikuMessage.usage.output_tokens,
    query,
    false
  );

  // Step 2: Google Places Text Search — validate and enrich
  let enrichedResults: SearchResult[];

  if (isGooglePlacesConfigured()) {
    const googlePlaces = await searchHotels(
      haikuResult.searchTerm || `hotels ${query}`
    );

    // Log Google Places usage (estimated cost ~$0.032 per Text Search)
    await logApiUsage(userId, "search", "google", 0, 0, query, false);

    if (googlePlaces.length > 0) {
      // Merge AI suggestions with Google data
      enrichedResults = mergeSearchResults(
        haikuResult.suggestedHotels,
        googlePlaces
      );
    } else {
      // Google returned nothing — use AI-only results
      enrichedResults = (haikuResult.suggestedHotels || []).map((h) => ({
        ...h,
        verified: false,
      }));
    }
  } else {
    // No Google API key — AI-only mode
    enrichedResults = (haikuResult.suggestedHotels || []).map((h) => ({
      ...h,
      verified: false,
    }));
  }

  const result: SearchResponse = {
    destination: haikuResult.destination,
    summary: haikuResult.summary,
    results: enrichedResults,
  };

  // Cache results
  await prisma.searchCache.upsert({
    where: { query: normalizedQuery },
    update: {
      results: result as unknown as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
    create: {
      query: normalizedQuery,
      results: result as unknown as Prisma.InputJsonValue,
    },
  });

  // Save search history
  await prisma.searchHistory.create({
    data: {
      userId,
      query,
      results: result as unknown as Prisma.InputJsonValue,
    },
  });

  return result;
}

/**
 * Merge AI suggestions with Google Places data
 * Google-verified hotels get priority; AI-only hotels marked as unverified
 */
function mergeSearchResults(
  aiHotels: SearchResult[],
  googlePlaces: GooglePlace[]
): SearchResult[] {
  const results: SearchResult[] = [];
  const usedGoogleIds = new Set<string>();

  // First: match AI hotels with Google Places by name similarity
  for (const aiHotel of aiHotels) {
    const match = findBestMatch(aiHotel.hotelName, googlePlaces);
    if (match && !usedGoogleIds.has(match.id)) {
      usedGoogleIds.add(match.id);
      results.push({
        ...aiHotel,
        hotelName: match.displayName?.text || aiHotel.hotelName,
        location: match.formattedAddress || aiHotel.location,
        googlePlaceId: match.id,
        googleRating: match.rating,
        googleReviewCount: match.userRatingCount,
        photoUrl: match.photos?.[0]
          ? getPhotoUrl(match.photos[0].name)
          : undefined,
        verified: true,
        latitude: match.location?.latitude,
        longitude: match.location?.longitude,
      });
    } else {
      results.push({ ...aiHotel, verified: false });
    }
  }

  // Add remaining Google results not matched to AI suggestions
  for (const gp of googlePlaces) {
    if (usedGoogleIds.has(gp.id)) continue;
    if (results.length >= 12) break;

    results.push({
      hotelName: gp.displayName?.text || "Unknown",
      location: gp.formattedAddress || "",
      aiScore: googleRatingToAiScore(gp.rating || 0),
      priceRange: priceLevelToRange(gp.priceLevel),
      distance: "",
      shortSummary: `Google rating: ${gp.rating || "N/A"} (${gp.userRatingCount || 0} recenzija)`,
      pros: [],
      cons: [],
      tags: [],
      googlePlaceId: gp.id,
      googleRating: gp.rating,
      googleReviewCount: gp.userRatingCount,
      photoUrl: gp.photos?.[0]
        ? getPhotoUrl(gp.photos[0].name)
        : undefined,
      verified: true,
      latitude: gp.location?.latitude,
      longitude: gp.location?.longitude,
    });
  }

  return results.sort((a, b) => b.aiScore - a.aiScore);
}

function findBestMatch(
  name: string,
  places: GooglePlace[]
): GooglePlace | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/gi, "");
  let bestMatch: GooglePlace | null = null;
  let bestScore = 0;

  for (const place of places) {
    const placeName = (place.displayName?.text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "");

    // Check word overlap
    const nameWords = normalized.split(/\s+/);
    const placeWords = placeName.split(/\s+/);
    const matchingWords = nameWords.filter((w) =>
      placeWords.some(
        (pw) => pw.includes(w) || w.includes(pw)
      )
    );
    const score = matchingWords.length / Math.max(nameWords.length, 1);

    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = place;
    }
  }

  return bestMatch;
}

function googleRatingToAiScore(rating: number): number {
  // Convert Google 1-5 scale to AI 1-10 scale
  return Math.round(rating * 2 * 10) / 10;
}

function priceLevelToRange(priceLevel?: string): string {
  switch (priceLevel) {
    case "PRICE_LEVEL_FREE":
      return "Besplatno";
    case "PRICE_LEVEL_INEXPENSIVE":
      return "€20-40/noć";
    case "PRICE_LEVEL_MODERATE":
      return "€40-80/noć";
    case "PRICE_LEVEL_EXPENSIVE":
      return "€80-150/noć";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "€150+/noć";
    default:
      return "N/A";
  }
}

// ============================================
// ANALYZE — 4-step pipeline
// ============================================

export async function analyzeHotel(
  hotelName: string,
  location: string,
  userId: string,
  googlePlaceId?: string,
  forceRefresh = false
): Promise<HotelAnalysis> {
  // Check hotel cache first (permanent — no TTL expiry)
  if (!forceRefresh) {
    const cached = await prisma.hotelCache.findUnique({
      where: { name_location: { name: hotelName, location } },
    });

    if (cached?.aiAnalysis) {
      await logApiUsage(userId, "analyze", "cache", 0, 0, hotelName, true);
      const cachedResult = cached.aiAnalysis as unknown as HotelAnalysis;
      cachedResult.cachedAt = cached.updatedAt.toISOString();
      return cachedResult;
    }
  }

  // Check rate limit
  const limit = await checkUserLimit(userId);
  if (!limit.allowed) {
    throw new Error(
      `Dostignut mesecni limit (${limit.used}/${limit.limit}). Nadogradi na Premium za neogranicene pretrage.`
    );
  }

  // Check daily cost limit
  if (!(await checkDailyCostLimit())) {
    throw new Error("Dnevni limit troškova je dostignut. Pokušaj ponovo sutra.");
  }

  // Try the full pipeline with Google + Gemini + Claude
  let placeDetails: GooglePlace | null = null;
  let nearbyPlaces: { name: string; type: string; rating: number; distance: string; detail: string; photoUrl?: string; reviewCount?: number }[] = [];
  let geminiAnalysis: GeminiAnalysis | null = null;
  let photos: string[] = [];
  let dataQuality: "full" | "partial" | "ai_only" = "ai_only";

  // Step 1: Google Places Details (if we have placeId)
  if (isGooglePlacesConfigured() && googlePlaceId) {
    placeDetails = await getPlaceDetails(googlePlaceId);

    if (placeDetails) {
      // Log Google usage
      await logApiUsage(userId, "analyze", "google", 0, 0, hotelName, false);

      // Extract photos
      photos = (placeDetails.photos || [])
        .slice(0, 10)
        .map((p) => getPhotoUrl(p.name));

      // Step 2: Google Nearby Places
      if (placeDetails.location) {
        const rawNearby = await getNearbyPlaces(
          placeDetails.location.latitude,
          placeDetails.location.longitude
        );

        nearbyPlaces = rawNearby
          .filter(
            (p) =>
              p.displayName?.text?.toLowerCase() !==
              hotelName.toLowerCase()
          )
          .slice(0, 8)
          .map((p) => {
            const dist = placeDetails!.location
              ? calculateDistance(
                  placeDetails!.location!.latitude,
                  placeDetails!.location!.longitude,
                  p.location?.latitude || 0,
                  p.location?.longitude || 0
                )
              : 0;
            return {
              name: p.displayName?.text || "",
              type: mapGoogleType(p.primaryType || ""),
              rating: p.rating || 0,
              distance: formatDistance(dist),
              detail: p.formattedAddress || "",
              photoUrl: p.photos?.[0]
                ? getPhotoUrl(p.photos[0].name)
                : undefined,
              reviewCount: p.userRatingCount,
            };
          });

        dataQuality = "partial";
      }

      // Step 3: Gemini bulk review analysis
      if (isGeminiConfigured() && placeDetails.reviews && placeDetails.reviews.length > 0) {
        const reviewInputs: ReviewInput[] = placeDetails.reviews.map(
          (r: GoogleReview) => ({
            text: r.originalText?.text || r.text?.text || "",
            rating: r.rating,
            language: r.originalText?.languageCode || r.text?.languageCode,
            date: r.publishTime,
            author: r.authorAttribution?.displayName,
          })
        );

        const nearbyInputs: NearbyInput[] = nearbyPlaces.map((p) => ({
          name: p.name,
          type: p.type,
          rating: p.rating,
          distance: p.distance,
          reviewCount: p.reviewCount,
        }));

        geminiAnalysis = await analyzeReviewsBulk(
          hotelName,
          reviewInputs,
          nearbyInputs
        );

        if (geminiAnalysis) {
          // Log Gemini usage (estimated)
          await logApiUsage(
            userId,
            "analyze",
            "gemini",
            0,
            0,
            hotelName,
            false
          );
          dataQuality = "full";
        }
      }
    }
  }

  // Step 4: Claude Sonnet — final report with cross-references
  const sonnetPrompt = buildSonnetPrompt(
    hotelName,
    location,
    placeDetails,
    nearbyPlaces,
    geminiAnalysis,
    dataQuality
  );

  const sonnetMessage = await anthropic.messages.create({
    model: ANALYZE_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: sonnetPrompt }],
  });

  const sonnetText =
    sonnetMessage.content[0].type === "text"
      ? sonnetMessage.content[0].text
      : "";

  let result: HotelAnalysis;
  try {
    const cleaned = sonnetText.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    const jsonMatch = sonnetText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch {
        const fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, "}")
          .replace(/,\s*\]/g, "]");
        result = JSON.parse(fixedJson);
      }
    } else {
      throw new Error("AI nije vratio validan odgovor");
    }
  }

  // Enrich result with Google data
  result.googlePlaceId = googlePlaceId || placeDetails?.id;
  result.googleRating = placeDetails?.rating;
  result.googleReviewCount = placeDetails?.userRatingCount;
  result.photos = photos;
  result.verified = !!placeDetails;
  result.dataQuality = dataQuality;
  result.languageBreakdown = geminiAnalysis?.languageBreakdown;
  result.latitude = placeDetails?.location?.latitude;
  result.longitude = placeDetails?.location?.longitude;
  result.cachedAt = new Date().toISOString();

  // Merge Gemini trends and quotes into scores
  if (geminiAnalysis) {
    for (const score of result.scores) {
      const geminiScore = geminiAnalysis.scores.find(
        (gs) =>
          gs.category.toLowerCase() === score.category.toLowerCase() ||
          gs.category
            .toLowerCase()
            .includes(score.category.toLowerCase().slice(0, 4))
      );
      if (geminiScore) {
        score.trend = geminiScore.trend;
        score.sampleQuote =
          geminiScore.positiveQuotes[0] || geminiScore.negativeQuotes[0];
        score.mentionCount = geminiScore.mentionCount;
      }
    }
  }

  // Enrich nearby with real data
  if (nearbyPlaces.length > 0) {
    result.nearby = nearbyPlaces.slice(0, 6).map((np) => ({
      name: np.name,
      type: np.type as "restaurant" | "beach" | "bar" | "attraction",
      rating: np.rating,
      distance: np.distance,
      detail: np.detail,
      photoUrl: np.photoUrl,
      reviewCount: np.reviewCount,
    }));
  }

  // Log Sonnet usage
  await logApiUsage(
    userId,
    "analyze",
    ANALYZE_MODEL,
    sonnetMessage.usage.input_tokens,
    sonnetMessage.usage.output_tokens,
    hotelName,
    false
  );

  // Cache in HotelCache
  await prisma.hotelCache.upsert({
    where: { name_location: { name: hotelName, location } },
    update: {
      aiAnalysis: result as unknown as Prisma.InputJsonValue,
      aiScore: result.aiScore,
      googlePlaceId: result.googlePlaceId,
      latitude: placeDetails?.location?.latitude,
      longitude: placeDetails?.location?.longitude,
      googleRating: placeDetails?.rating,
      googleReviewCount: placeDetails?.userRatingCount,
      googlePhotos: photos.length > 0 ? (photos as unknown as Prisma.InputJsonValue) : undefined,
      googleReviews: placeDetails?.reviews
        ? (placeDetails.reviews as unknown as Prisma.InputJsonValue)
        : undefined,
      nearbyPlaces: nearbyPlaces.length > 0
        ? (nearbyPlaces as unknown as Prisma.InputJsonValue)
        : undefined,
      geminiAnalysis: geminiAnalysis
        ? (geminiAnalysis as unknown as Prisma.InputJsonValue)
        : undefined,
      updatedAt: new Date(),
    },
    create: {
      name: hotelName,
      location,
      aiAnalysis: result as unknown as Prisma.InputJsonValue,
      aiScore: result.aiScore,
      sources: result.reviewSources || [],
      googlePlaceId: result.googlePlaceId,
      latitude: placeDetails?.location?.latitude,
      longitude: placeDetails?.location?.longitude,
      googleRating: placeDetails?.rating,
      googleReviewCount: placeDetails?.userRatingCount,
      googlePhotos: photos.length > 0 ? (photos as unknown as Prisma.InputJsonValue) : undefined,
      googleReviews: placeDetails?.reviews
        ? (placeDetails.reviews as unknown as Prisma.InputJsonValue)
        : undefined,
      nearbyPlaces: nearbyPlaces.length > 0
        ? (nearbyPlaces as unknown as Prisma.InputJsonValue)
        : undefined,
      geminiAnalysis: geminiAnalysis
        ? (geminiAnalysis as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });

  return result;
}

function buildSonnetPrompt(
  hotelName: string,
  location: string,
  placeDetails: GooglePlace | null,
  nearbyPlaces: { name: string; type: string; rating: number; distance: string; detail: string }[],
  geminiAnalysis: GeminiAnalysis | null,
  dataQuality: string
): string {
  let context = "";

  if (placeDetails) {
    context += `\nGOOGLE PODACI:
- Rating: ${placeDetails.rating}/5 (${placeDetails.userRatingCount} recenzija)
- Adresa: ${placeDetails.formattedAddress}
- Telefon: ${placeDetails.nationalPhoneNumber || "N/A"}
- Website: ${placeDetails.websiteUri || "N/A"}\n`;
  }

  if (geminiAnalysis) {
    context += `\nGEMINI ANALIZA RECENZIJA (${geminiAnalysis.totalReviewsAnalyzed} recenzija analizirano):
Ukupna ocena: ${geminiAnalysis.overallScore}/10

SKOROVI PO KATEGORIJAMA:
${geminiAnalysis.scores
  .map(
    (s) =>
      `- ${s.category}: ${s.score}/10 (${s.mentionCount} pomena, trend: ${s.trend})
  Pozitivno: ${s.positiveQuotes.slice(0, 2).join("; ")}
  Negativno: ${s.negativeQuotes.slice(0, 2).join("; ")}`
  )
  .join("\n")}

SLABOSTI:
${geminiAnalysis.weaknesses.map((w) => `- ${w.category} (severity: ${w.severity}): ${w.detail}`).join("\n")}

SNAGE:
${geminiAnalysis.strengths.map((s) => `- ${s.category}: ${s.detail}`).join("\n")}

Review bombing: ${geminiAnalysis.reviewBombing ? "DA - " + geminiAnalysis.reviewBombingDetail : "NE"}

Jezici: ${geminiAnalysis.languageBreakdown.map((l) => `${l.flag} ${l.language}: ${l.count}`).join(", ")}`;
  }

  if (nearbyPlaces.length > 0) {
    context += `\n\nOBLIŽNJA MESTA (pravi Google podaci):
${nearbyPlaces.map((p) => `- ${p.name} (${p.type}) — ★${p.rating}, ${p.distance}`).join("\n")}`;
  }

  const crossRefInstruction =
    geminiAnalysis && nearbyPlaces.length > 0
      ? `
CROSS-REFERENCE INSTRUKCIJA:
- Ako je doručak ocenjen ispod 6, proveri nearby restorane i preporuči onaj sa najviše recenzija kao alternativu.
- Ako wifi ne radi, naglasi za remote workere.
- Poveži slabosti hotela sa rešenjima iz okoline.
- Za svaku slabost, ako postoji obližnje mesto koje može kompenzovati, navedi ga u aiTip ili nearby.`
      : "";

  return `Ti si turisticki AI asistent. Napravi FINALNI detaljan izveštaj za hotel.

HOTEL: "${hotelName}" u lokaciji "${location}"
KVALITET PODATAKA: ${dataQuality}
${context}
${crossRefInstruction}

Na osnovu SVIH dostupnih podataka, napravi finalnu analizu.
${dataQuality === "ai_only" ? "NAPOMENA: Nemaš Google podatke — koristi svoje znanje ali naglasi da analiza nije verifikovana." : ""}
${dataQuality === "full" ? "Imaš PRAVE recenzije i Gemini analizu — koristi ih za precizne skorove i citate." : ""}

VAZAN FORMAT - vrati SAMO validan JSON:
{
  "hotelName": "${hotelName}",
  "location": "${location}",
  "aiScore": 7.5,
  "summary": "2-3 recenice - generalni utisak",
  "scores": [
    {
      "category": "Lokacija",
      "score": 8.5,
      "verdict": "odlicno",
      "detail": "konkretan opis",
      "mentionCount": 245,
      "trend": "stable",
      "sampleQuote": "pravi citat iz recenzije ako postoji"
    },
    {"category": "Čistoća", "score": 7.0, "verdict": "dobro", "detail": "...", "mentionCount": 180},
    {"category": "Osoblje", "score": 8.0, "verdict": "dobro", "detail": "...", "mentionCount": 150},
    {"category": "Kreveti i sobe", "score": 6.0, "verdict": "prosecno", "detail": "...", "mentionCount": 200},
    {"category": "Doručak", "score": 5.0, "verdict": "lose", "detail": "...", "mentionCount": 170},
    {"category": "WiFi", "score": 4.0, "verdict": "lose", "detail": "...", "mentionCount": 130},
    {"category": "Vrednost za novac", "score": 7.5, "verdict": "dobro", "detail": "...", "mentionCount": 160}
  ],
  "pros": ["prednost 1", "prednost 2", "prednost 3"],
  "cons": ["mana 1", "mana 2", "mana 3"],
  "aiTip": "konkretan savet sa cross-referencom na nearby mesta ako dostupno",
  "nearby": [
    {
      "name": "naziv mesta",
      "type": "restaurant",
      "rating": 4.5,
      "distance": "400m",
      "detail": "sta nude, cena",
      "crossRef": "Odlicna alternativa za dorucak ako je hotelski slab"
    }
  ],
  "priceRange": "€40-65/noc",
  "bestFor": ["parovi", "budget putnici"],
  "reviewSources": ${placeDetails ? '["Google Reviews"]' : '["AI procena"]'},
  "totalReviews": ${placeDetails?.userRatingCount || 0}
}

Budi realan i iskren. Koristi PRAVE podatke kad su dostupni.
verdict mora biti: "odlicno" (8+), "dobro" (6-8), "prosecno" (4-6), "lose" (<4).
Odgovaraj na srpskom jeziku.`;
}

function mapGoogleType(type: string): string {
  const typeMap: Record<string, string> = {
    restaurant: "restaurant",
    bar: "bar",
    cafe: "bar",
    tourist_attraction: "attraction",
    beach: "beach",
    park: "attraction",
    museum: "attraction",
    shopping_mall: "attraction",
    night_club: "bar",
  };
  return typeMap[type] || "attraction";
}
