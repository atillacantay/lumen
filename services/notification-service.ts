import { db } from "@/config/firebase";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";

const USERS_COLLECTION = "users";

// Notification types
export type NotificationType = "post_hug" | "post_comment" | "comment_hug";

export interface NotificationData {
  type: NotificationType;
  postId?: string;
  commentId?: string;
  fromUserId: string;
  fromUserName: string;
}

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and get the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  // Push notifications don't work on emulators/simulators
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  // Get project ID for Expo push token
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Android needs a notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Varsayılan",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#7C3AED",
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Save push token to user document in Firestore
 */
export async function savePushToken(
  userId: string,
  token: string
): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving push token:", error);
  }
}

/**
 * Get push token for a user
 */
export async function getUserPushToken(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data()?.pushToken || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user push token:", error);
    return null;
  }
}

/**
 * Send a push notification using Expo's push service
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: NotificationData
): Promise<void> {
  const message = {
    to: expoPushToken,
    sound: "default" as const,
    title,
    body,
    data,
  };

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

/**
 * Notification messages by type
 */
const notificationMessages: Record<
  NotificationType,
  { title: string; body: (name: string) => string }
> = {
  post_hug: {
    title: "Yeni bir kucaklama! 🤗",
    body: (name) => `${name} paylaşımını kucakladı`,
  },
  post_comment: {
    title: "Yeni bir yorum! 💬",
    body: (name) => `${name} paylaşımına yorum yaptı`,
  },
  comment_hug: {
    title: "Yorumun kucaklandı! 🤗",
    body: (name) => `${name} yorumunu kucakladı`,
  },
};

/**
 * Send notification for post hug
 */
export async function notifyPostHug(
  postAuthorId: string,
  fromUserId: string,
  fromUserName: string,
  postId: string
): Promise<void> {
  // Don't notify if user hugged their own post
  if (postAuthorId === fromUserId) return;

  const token = await getUserPushToken(postAuthorId);
  if (!token) return;

  const { title, body } = notificationMessages.post_hug;
  await sendPushNotification(token, title, body(fromUserName), {
    type: "post_hug",
    postId,
    fromUserId,
    fromUserName,
  });
}

/**
 * Send notification for new comment on post
 */
export async function notifyPostComment(
  postAuthorId: string,
  fromUserId: string,
  fromUserName: string,
  postId: string
): Promise<void> {
  // Don't notify if user commented on their own post
  if (postAuthorId === fromUserId) return;

  const token = await getUserPushToken(postAuthorId);
  if (!token) return;

  const { title, body } = notificationMessages.post_comment;
  await sendPushNotification(token, title, body(fromUserName), {
    type: "post_comment",
    postId,
    fromUserId,
    fromUserName,
  });
}

/**
 * Send notification for comment hug
 */
export async function notifyCommentHug(
  commentAuthorId: string,
  fromUserId: string,
  fromUserName: string,
  postId: string,
  commentId: string
): Promise<void> {
  // Don't notify if user hugged their own comment
  if (commentAuthorId === fromUserId) return;

  const token = await getUserPushToken(commentAuthorId);
  if (!token) return;

  const { title, body } = notificationMessages.comment_hug;
  await sendPushNotification(token, title, body(fromUserName), {
    type: "comment_hug",
    postId,
    commentId,
    fromUserId,
    fromUserName,
  });
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener (foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}
