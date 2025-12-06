import { db } from "@/config/firebase";
import {
  defaultNotificationPreferences,
  NotificationPreferences,
} from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const USERS_COLLECTION = "users";

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        postHug: data.notificationPrefs?.postHug ?? true,
        postComment: data.notificationPrefs?.postComment ?? true,
        commentHug: data.notificationPrefs?.commentHug ?? true,
      };
    }

    return defaultNotificationPreferences;
  } catch {
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
  } catch (error) {
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
