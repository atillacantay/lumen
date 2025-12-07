import { APP_CONFIG } from "@/config";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onCreatePress?: () => void;
};

export default function HomeHeader({ onCreatePress }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      <View>
        <Text style={[styles.logo, { color: colors.primary }]}>
          {APP_CONFIG.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Dertleş, Rahatla 🌙
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={onCreatePress}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});
