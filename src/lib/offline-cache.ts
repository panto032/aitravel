"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "travelai-offline";
const DB_VERSION = 1;

interface OfflineDB {
  analyses: {
    key: string;
    value: {
      data: unknown;
      timestamp: number;
      size: number;
    };
  };
  searches: {
    key: string;
    value: {
      data: unknown;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("analyses")) {
          db.createObjectStore("analyses");
        }
        if (!db.objectStoreNames.contains("searches")) {
          db.createObjectStore("searches");
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save hotel analysis to IndexedDB for offline access
 */
export async function cacheAnalysis(
  key: string,
  data: unknown
): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const serialized = JSON.stringify(data);
  await db.put("analyses", {
    data,
    timestamp: Date.now(),
    size: serialized.length,
  }, key);
}

/**
 * Get cached analysis from IndexedDB
 */
export async function getCachedAnalysis(
  key: string
): Promise<unknown | null> {
  const db = await getDB();
  if (!db) return null;

  const entry = await db.get("analyses", key);
  return entry?.data || null;
}

/**
 * Save search results to IndexedDB
 */
export async function cacheSearch(
  query: string,
  data: unknown
): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const normalized = query.trim().toLowerCase();
  await db.put("searches", {
    data,
    timestamp: Date.now(),
  }, normalized);
}

/**
 * Get cached search from IndexedDB
 */
export async function getCachedSearch(
  query: string
): Promise<unknown | null> {
  const db = await getDB();
  if (!db) return null;

  const normalized = query.trim().toLowerCase();
  const entry = await db.get("searches", normalized);
  return entry?.data || null;
}

/**
 * Get offline storage stats
 */
export async function getOfflineStats(): Promise<{
  analysisCount: number;
  totalSizeMB: number;
}> {
  const db = await getDB();
  if (!db) return { analysisCount: 0, totalSizeMB: 0 };

  const keys = await db.getAllKeys("analyses");
  let totalSize = 0;

  for (const key of keys) {
    const entry = await db.get("analyses", key);
    if (entry) totalSize += entry.size;
  }

  return {
    analysisCount: keys.length,
    totalSizeMB: Math.round((totalSize / 1024 / 1024) * 10) / 10,
  };
}

/**
 * Clear all offline data
 */
export async function clearOfflineCache(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  await db.clear("analyses");
  await db.clear("searches");
}
