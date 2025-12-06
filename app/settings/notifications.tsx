import {
  NotificationInfoBanner,
  NotificationSettingsHeader,
  NotificationSettingsList,
} from "@/components/settings";
import { Colors, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/settings-service";
import { NotificationPreferences } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationItem {
  id: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const notificationSettings: NotificationItem[] = [
  {
    id: "postHug",
    title: "Gönderi Kucaklamaları",
    description: "Birisi gönderini kucakladığında bildirim al",
    icon: "heart-outline",
  },
  {
    id: "postComment",
    title: "Yeni Yorumlar",
    description: "Birisi gönderine yorum yaptığında bildirim al",
    icon: "chatbubble-outline",
  },
  {
    id: "commentHug",
    title: "Yorum Kucaklamaları",
    description: "Birisi yorumunu kucakladığında bildirim al",
    icon: "heart-circle-outline",
  },
];

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    postHug: true,
    postComment: true,
    commentHug: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const prefs = await getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!user || updating) return;

    const newValue = !preferences[key];
    setUpdating(key);

    // Optimistic update
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    try {
      await updateNotificationPreferences(user.id, { [key]: newValue });
    } catch {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
    } finally {
      setUpdating(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <NotificationSettingsHeader topInset={insets.top} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <NotificationSettingsHeader topInset={insets.top} />

      {/* Settings Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <NotificationInfoBanner />

        {/* Settings List */}
        <NotificationSettingsList
          items={notificationSettings}
          preferences={preferences}
          updatingKey={updating}
          onToggle={handleToggle}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
