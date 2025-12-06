import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  sortLabel: string;
  timeLabel?: string;
  onPress?: () => void;
  isDisabled?: boolean;
};

export default function HomeFilters({
  sortLabel,
  timeLabel,
  onPress,
  isDisabled,
}: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: colors.background, opacity: isDisabled ? 0.5 : 1 },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={[styles.filterButtonText, { color: colors.text }]}>
          {sortLabel}
        </Text>
        {timeLabel && (
          <>
            <View
              style={[styles.filterDot, { backgroundColor: colors.border }]}
            />
            <Text
              style={[styles.filterButtonText, { color: colors.textMuted }]}
            >
              {timeLabel}
            </Text>
          </>
        )}
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  filterButtonText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
