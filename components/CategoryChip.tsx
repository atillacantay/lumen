import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { Category } from "@/types";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
  size?: "small" | "medium";
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onPress,
  size = "medium",
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isSmall = size === "small";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? category.color : colors.surface,
          borderColor: category.color,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? Spacing.xs : Spacing.sm,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { fontSize: isSmall ? 14 : 18 }]}>
        {category.emoji}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: selected ? "#FFFFFF" : colors.text,
            fontSize: isSmall ? FontSize.xs : FontSize.sm,
          },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontWeight: "500",
  },
});
