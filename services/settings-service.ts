import { db } from "@/config/firebase";
import {
  defaultNotificationPreferences,
  NotificationPreferences,
} from "@/types";
import { CacheDuration, getCache, removeCache, setCache } from "@/utils/cache";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const USERS_COLLECTION = "users";

// Cache key for notification preferences
const getNotificationPrefsCacheKey = (userId: string) =>
  `notification_prefs_${userId}`;

/**
 * Get notification preferences for a user (with cache)
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const cacheKey = getNotificationPrefsCacheKey(userId);

  // Check cache first
  const cached = await getCache<NotificationPreferences>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    let prefs: NotificationPreferences;

    if (userSnap.exists()) {
      const data = userSnap.data();
      prefs = {
        postHug: data.notificationPrefs?.postHug ?? true,
        postComment: data.notificationPrefs?.postComment ?? true,
        commentHug: data.notificationPrefs?.commentHug ?? true,
      };
    } else {
      prefs = defaultNotificationPreferences;
    }

    // Cache for 1 hour
    await setCache(cacheKey, prefs, CacheDuration.LONG);

    return prefs;
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return defaultNotificationPreferences;
  }
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const cacheKey = getNotificationPrefsCacheKey(userId);

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const currentPrefs = await getNotificationPreferences(userId);

    const newPrefs = {
      ...currentPrefs,
      ...preferences,
    };

    await updateDoc(userRef, {
      notificationPrefs: newPrefs,
    });

    // Update cache with new preferences
    await setCache(cacheKey, newPrefs, CacheDuration.LONG);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    // Invalidate cache on error
    await removeCache(cacheKey);
    throw error;
  }
}

/**
 * Check if a specific notification type is enabled for a user
 */
export async function isNotificationEnabled(
  userId: string,
  type: keyof NotificationPreferences
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  return prefs[type];
}

/**
 * Clear notification preferences cache for a user
 */
export async function clearNotificationPrefsCache(
  userId: string
): Promise<void> {
  const cacheKey = getNotificationPrefsCacheKey(userId);
  await removeCache(cacheKey);
}
