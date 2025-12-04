import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/settings-service";
import { NotificationPreferences } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationSettingItem {
  id: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const notificationSettings: NotificationSettingItem[] = [
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
  const router = useRouter();
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
  }, []);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const prefs = await getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
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
    } catch (error) {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
      console.error("Error updating preference:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              paddingTop: insets.top + Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Bildirimler
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Bildirimler
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View
          style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Bildirim tercihlerini buradan yönetebilirsin
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {notificationSettings.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.item,
                index < notificationSettings.length - 1 && {
                  borderBottomColor: colors.border,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.itemDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
              <Switch
                value={preferences[item.id]}
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={
                  preferences[item.id] ? colors.primary : colors.textMuted
                }
                disabled={updating === item.id}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  section: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
