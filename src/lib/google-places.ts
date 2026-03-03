// Google Places API (New) wrapper
// Uses REST API directly for cost control with field masks

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const BASE_URL = "https://places.googleapis.com/v1";

export interface GooglePlace {
  id: string;
  displayName: { text: string; languageCode?: string };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string; widthPx: number; heightPx: number }[];
  location?: { latitude: number; longitude: number };
  priceLevel?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  reviews?: GoogleReview[];
}

export interface GoogleReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text?: { text: string; languageCode?: string };
  originalText?: { text: string; languageCode?: string };
  authorAttribution: {
    displayName: string;
    photoUri?: string;
  };
  publishTime: string;
}

export interface NearbyPlace {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  photos?: { name: string; widthPx: number; heightPx: number }[];
  location?: { latitude: number; longitude: number };
}

export function isGooglePlacesConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Text Search — 1 call returns up to 20 hotels
 * Uses minimal field mask for lower pricing tier
 */
export async function searchHotels(query: string): Promise<GooglePlace[]> {
  if (!API_KEY) return [];

  try {
    const res = await fetch(`${BASE_URL}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.location,places.priceLevel",
      },
      body: JSON.stringify({
        textQuery: query,
        includedType: "hotel",
        languageCode: "sr",
        maxResultCount: 20,
      }),
    });

    if (!res.ok) {
      console.error("Google Places search error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return data.places || [];
  } catch (error) {
    console.error("Google Places search failed:", error);
    return [];
  }
}

/**
 * Place Details — gets reviews, photos, phone, website
 */
export async function getPlaceDetails(
  placeId: string
): Promise<GooglePlace | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(`${BASE_URL}/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,rating,userRatingCount,photos,location,priceLevel,websiteUri,nationalPhoneNumber,reviews",
      },
    });

    if (!res.ok) {
      console.error("Google Places details error:", res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Google Places details failed:", error);
    return null;
  }
}

/**
 * Nearby Search — 1 call with multiple types
 * Returns restaurants, bars, attractions, cafes near coordinates
 */
export async function getNearbyPlaces(
  lat: number,
  lng: number,
  radiusMeters: number = 1000
): Promise<NearbyPlace[]> {
  if (!API_KEY) return [];

  try {
    const res = await fetch(`${BASE_URL}/places:searchNearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryType,places.photos,places.location",
      },
      body: JSON.stringify({
        includedTypes: [
          "restaurant",
          "bar",
          "tourist_attraction",
          "cafe",
        ],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
        languageCode: "sr",
      }),
    });

    if (!res.ok) {
      console.error("Google Places nearby error:", res.status);
      return [];
    }

    const data = await res.json();
    return data.places || [];
  } catch (error) {
    console.error("Google Places nearby failed:", error);
    return [];
  }
}

/**
 * Construct photo URL via our proxy route (hides API key)
 */
export function getPhotoUrl(
  photoName: string,
  maxWidth: number = 800
): string {
  const ref = encodeURIComponent(photoName);
  return `/api/photos/${ref}?maxWidth=${maxWidth}`;
}

/**
 * Direct Google photo URL (for server-side use only)
 */
export function getDirectPhotoUrl(
  photoName: string,
  maxWidth: number = 800
): string {
  if (!API_KEY) return "";
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

/**
 * Calculate distance between two coordinates in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
