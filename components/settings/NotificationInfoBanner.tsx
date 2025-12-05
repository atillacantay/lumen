import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export function NotificationInfoBanner() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.banner, { backgroundColor: colors.primaryLight }]}>
      <Ionicons name="information-circle" size={20} color={colors.primary} />
      <Text style={[styles.text, { color: colors.primary }]}>
        Bildirim tercihlerini buradan yönetebilirsin
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 14,
  },
});
