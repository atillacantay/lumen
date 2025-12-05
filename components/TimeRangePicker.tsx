import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TimeRange, TimeRangeOption } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { key: "6h", label: "6h", icon: "", hours: 6 },
  { key: "24h", label: "24h", icon: "", hours: 24 },
  { key: "1w", label: "1w", icon: "", hours: 7 * 24 },
  { key: "1m", label: "1m", icon: "", hours: 30 * 24 },
  { key: "all", label: "Tümü", icon: "", hours: null },
];

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        {TIME_RANGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.chip,
              value === option.key && {
                backgroundColor: colors.primary + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    value === option.key ? colors.primary : colors.textMuted,
                  fontWeight: value === option.key ? "600" : "500",
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  content: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: FontSize.xs,
  },
});
