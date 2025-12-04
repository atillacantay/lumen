import { Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, Text, View } from "react-native";

export function PostDetailError() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>😕</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Post bulunamadı
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  icon: {
    fontSize: 48,
  },
  text: {
    fontSize: FontSize.md,
  },
});
