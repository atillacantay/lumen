import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  NotificationData,
  registerForPushNotificationsAsync,
  savePushToken,
} from "@/services/notification-service";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registerForNotifications: (userId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
  registerForNotifications: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const router = useRouter();

  // Handle notification tap - navigate to relevant screen
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as unknown as
        | NotificationData
        | undefined;

      if (data?.postId) {
        // Navigate to post detail
        router.push(`/post/${data.postId}` as any);
      }
    },
    [router]
  );

  // Register for push notifications
  const registerForNotifications = useCallback(async (userId: string) => {
    const token = await registerForPushNotificationsAsync();

    if (token) {
      setExpoPushToken(token);
      // Save token to Firestore
      await savePushToken(userId, token);
    }
  }, []);

  useEffect(() => {
    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [handleNotificationResponse]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        registerForNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
