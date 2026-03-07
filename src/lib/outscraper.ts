// Outscraper Google Maps Reviews API integration
// Docs: https://outscraper.com/google-maps-reviews-api/
// Free tier: 500 reviews/month, then $3/1K reviews

const API_KEY = process.env.OUTSCRAPER_API_KEY;
const BASE_URL = "https://api.app.outscraper.com";

export interface OutscraperReview {
  author_title: string;
  review_text: string;
  review_rating: number;
  review_datetime_utc: string;
  review_likes: number;
  owner_answer: string | null;
  review_id: string;
}

export interface OutscraperResult {
  name: string;
  google_id: string;
  rating: number;
  reviews: number;
  reviews_data: OutscraperReview[];
}

/**
 * Check if Outscraper is configured
 */
export function isOutscraperConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Fetch Google Maps reviews for a hotel via Outscraper
 * @param query - Hotel name or Google Place ID (place_id:ChIJ...)
 * @param reviewsLimit - Number of reviews to fetch (default 50)
 * @param language - Language filter (empty = all languages)
 * @param sort - Sort order: "most_relevant", "newest", "highest_rating", "lowest_rating"
 */
export async function fetchGoogleReviews(
  query: string,
  reviewsLimit = 50,
  language = "",
  sort = "newest"
): Promise<OutscraperResult | null> {
  if (!API_KEY) {
    console.log("[Outscraper] No API key configured");
    return null;
  }

  try {
    const params = new URLSearchParams({
      query,
      reviewsLimit: reviewsLimit.toString(),
      sort,
      async: "false",
    });

    if (language) {
      params.set("language", language);
    }

    console.log(`[Outscraper] Fetching ${reviewsLimit} reviews for: ${query}`);

    const res = await fetch(`${BASE_URL}/maps/reviews-v3?${params.toString()}`, {
      headers: {
        "X-API-KEY": API_KEY,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Outscraper] API error ${res.status}:`, errText);
      return null;
    }

    const data = await res.json();

    // Outscraper returns { data: [[result]] } format
    const results = data?.data;
    if (!results || !results[0] || !results[0][0]) {
      console.log("[Outscraper] No results found");
      return null;
    }

    const result = results[0][0] as OutscraperResult;
    console.log(
      `[Outscraper] Got ${result.reviews_data?.length || 0} reviews for "${result.name}"`
    );

    return result;
  } catch (error) {
    console.error("[Outscraper] Fetch failed:", error);
    return null;
  }
}

/**
 * Fetch reviews by Google Place ID (most reliable)
 */
export async function fetchReviewsByPlaceId(
  placeId: string,
  reviewsLimit = 50
): Promise<OutscraperResult | null> {
  return fetchGoogleReviews(`place_id:${placeId}`, reviewsLimit);
}
