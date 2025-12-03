import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache key prefix for the app
const CACHE_PREFIX = "lumen_";

// Default cache durations (in milliseconds)
export const CacheDuration = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 30, // 30 minutes
  LONG: 1000 * 60 * 60, // 1 hour
  DAY: 1000 * 60 * 60 * 24, // 24 hours
  PERMANENT: -1, // Never expires (use for user data etc.)
} as const;

export type CacheDurationType =
  (typeof CacheDuration)[keyof typeof CacheDuration];

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // -1 for permanent
}

/**
 * Get the full cache key with prefix
 */
const getCacheKey = (key: string): string => `${CACHE_PREFIX}${key}`;

/**
 * Check if cache entry is expired
 */
const isExpired = (entry: CacheEntry<unknown>): boolean => {
  if (entry.ttl === CacheDuration.PERMANENT) {
    return false;
  }
  return Date.now() - entry.timestamp > entry.ttl;
};

/**
 * Get data from cache
 * @param key - Cache key (without prefix)
 * @returns Cached data or null if not found/expired
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cacheKey = getCacheKey(key);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);

    if (isExpired(entry)) {
      // Remove expired entry
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`Cache get error for key "${key}":`, error);
    return null;
  }
};

/**
 * Set data to cache
 * @param key - Cache key (without prefix)
 * @param data - Data to cache
 * @param ttl - Time to live in milliseconds (default: 1 hour)
 */
export const setCache = async <T>(
  key: string,
  data: T,
  ttl: CacheDurationType = CacheDuration.LONG
): Promise<void> => {
  try {
    const cacheKey = getCacheKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error(`Cache set error for key "${key}":`, error);
  }
};

/**
 * Remove data from cache
 * @param key - Cache key (without prefix)
 */
export const removeCache = async (key: string): Promise<void> => {
  try {
    const cacheKey = getCacheKey(key);
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.error(`Cache remove error for key "${key}":`, error);
  }
};

/**
 * Clear all app cache (keys with CACHE_PREFIX)
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error("Cache clear all error:", error);
  }
};

/**
 * Get data from cache or fetch from source
 * @param key - Cache key (without prefix)
 * @param fetcher - Function to fetch data if not in cache
 * @param ttl - Time to live in milliseconds
 * @param forceRefresh - Force refresh from source
 * @returns Cached or fetched data
 */
export const getCacheOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: CacheDurationType = CacheDuration.LONG,
  forceRefresh = false
): Promise<T> => {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Fetch from source
  const data = await fetcher();

  // Cache the result
  await setCache(key, data, ttl);

  return data;
};

/**
 * Get cache entry with metadata (for debugging or advanced use)
 */
export const getCacheEntry = async <T>(
  key: string
): Promise<CacheEntry<T> | null> => {
  try {
    const cacheKey = getCacheKey(key);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error(`Cache entry get error for key "${key}":`, error);
    return null;
  }
};

/**
 * Check if a cache key exists and is valid
 */
export const hasValidCache = async (key: string): Promise<boolean> => {
  const data = await getCache(key);
  return data !== null;
};
