"use client";

import {
  cacheAnalysis,
  getCachedAnalysis,
  cacheSearch,
  getCachedSearch,
} from "./offline-cache";

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/**
 * Smart fetch for search — caches results in IndexedDB
 */
export async function fetchSearch(query: string): Promise<{
  data: unknown;
  fromCache: boolean;
  offline: boolean;
}> {
  // Try online first
  if (isOnline()) {
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const data = await res.json();
        // Cache for offline
        await cacheSearch(query, data);
        return { data, fromCache: false, offline: false };
      }

      const err = await res.json();
      throw new Error(err.error || "Greška pri pretrazi");
    } catch (error) {
      // If network error, try cache
      if (!isOnline() || (error instanceof TypeError && error.message.includes("fetch"))) {
        const cached = await getCachedSearch(query);
        if (cached) {
          return { data: cached, fromCache: true, offline: true };
        }
      }
      throw error;
    }
  }

  // Offline: try cache
  const cached = await getCachedSearch(query);
  if (cached) {
    return { data: cached, fromCache: true, offline: true };
  }

  throw new Error("Nema interneta i nema keširanih podataka za ovu pretragu.");
}

/**
 * Smart fetch for hotel analysis — caches results in IndexedDB
 */
export async function fetchAnalysis(
  hotelName: string,
  location: string,
  googlePlaceId?: string,
  forceRefresh = false
): Promise<{
  data: unknown;
  fromCache: boolean;
  offline: boolean;
}> {
  const cacheKey = `${hotelName}:${location}`;

  // Try online first
  if (isOnline()) {
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelName, location, googlePlaceId, forceRefresh }),
      });

      if (res.ok) {
        const data = await res.json();
        // Cache for offline
        await cacheAnalysis(cacheKey, data);
        return { data, fromCache: false, offline: false };
      }

      const err = await res.json();
      throw new Error(err.error || "Greška pri analizi");
    } catch (error) {
      if (!isOnline() || (error instanceof TypeError && error.message.includes("fetch"))) {
        const cached = await getCachedAnalysis(cacheKey);
        if (cached) {
          return { data: cached, fromCache: true, offline: true };
        }
      }
      throw error;
    }
  }

  // Offline: try cache
  const cached = await getCachedAnalysis(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true, offline: true };
  }

  throw new Error("Nema interneta i nema keširanih podataka za ovaj hotel.");
}
