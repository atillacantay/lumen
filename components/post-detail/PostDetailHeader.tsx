import { Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PostDetailHeaderProps {
  title?: string;
  emoji?: string;
  showBack?: boolean;
}

export function PostDetailHeader({
  title = "Paylaşım",
  emoji,
  showBack = true,
}: PostDetailHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <Text
        style={[styles.headerTitle, { color: colors.text }]}
        numberOfLines={1}
      >
        {emoji ? `${emoji} ` : ""}
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
});
