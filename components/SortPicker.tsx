import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type SortOption = "newest" | "oldest";

interface SortPickerProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
];

export function SortPicker({ value, onChange }: SortPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <Ionicons
        name="filter-outline"
        size={16}
        color={colors.textSecondary}
        style={styles.icon}
      />
      {sortOptions.map((option) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                { color: isActive ? "#FFFFFF" : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  option: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  optionText: {
    fontSize: FontSize.xs,
    fontWeight: "500",
  },
});
