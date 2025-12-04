import { Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, Text, View } from "react-native";

interface ProfileEmptyStateProps {
  emoji: string;
  text: string;
}

export function ProfileEmptyState({ emoji, text }: ProfileEmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  text: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
