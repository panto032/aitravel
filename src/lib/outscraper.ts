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
 */
export async function fetchGoogleReviews(
  query: string,
  reviewsLimit = 50,
  sort = "most_relevant"
): Promise<OutscraperResult | null> {
  if (!API_KEY) {
    console.log("[Outscraper] No API key configured");
    return null;
  }

  try {
    // Build URL manually — Outscraper expects query as array-like param
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("reviewsLimit", reviewsLimit.toString());
    params.set("sort", sort);
    params.set("limit", "1");
    params.set("async", "false");
    params.set("language", "en");

    const url = `${BASE_URL}/maps/reviews-v3?${params.toString()}`;
    console.log(`[Outscraper] Fetching ${reviewsLimit} reviews for: ${query}`);

    const res = await fetch(url, {
      headers: {
        "X-API-KEY": API_KEY,
        "client": "Node Custom",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Outscraper] API error ${res.status}:`, errText);
      return null;
    }

    const responseData = await res.json();
    console.log(`[Outscraper] Response keys: ${Object.keys(responseData)}`);

    // Handle different response formats
    let result: OutscraperResult | null = null;

    if (responseData.data) {
      // Format: { data: [[{...}]] } or { data: [{...}] }
      const data = responseData.data;
      if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0]) && data[0].length > 0) {
          result = data[0][0] as OutscraperResult;
        } else if (data[0] && !Array.isArray(data[0])) {
          result = data[0] as OutscraperResult;
        }
      }
    } else if (Array.isArray(responseData) && responseData.length > 0) {
      // Format: [[{...}]] or [{...}]
      if (Array.isArray(responseData[0]) && responseData[0].length > 0) {
        result = responseData[0][0] as OutscraperResult;
      } else if (responseData[0] && !Array.isArray(responseData[0])) {
        result = responseData[0] as OutscraperResult;
      }
    }

    if (!result) {
      console.log("[Outscraper] No results found in response");
      console.log(`[Outscraper] Response preview: ${JSON.stringify(responseData).slice(0, 500)}`);
      return null;
    }

    const reviewCount = result.reviews_data?.length || 0;
    console.log(`[Outscraper] Got ${reviewCount} reviews for "${result.name}"`);

    if (reviewCount === 0) {
      console.log("[Outscraper] Zero reviews returned");
      return null;
    }

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
  return fetchGoogleReviews(placeId, reviewsLimit);
}
