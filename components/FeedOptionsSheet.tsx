import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SortOption } from "@/services/post-service";
import { TimeRange } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SORT_OPTIONS: {
  key: SortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hasTimeFilter: boolean;
}[] = [
  {
    key: "newest",
    label: "En Yeni",
    icon: "time-outline",
    hasTimeFilter: false,
  },
  { key: "popular", label: "Popüler", icon: "heart", hasTimeFilter: true },
  {
    key: "mostComments",
    label: "En Çok Yorum",
    icon: "chatbubble",
    hasTimeFilter: true,
  },
];

const TIME_RANGE_OPTIONS: {
  key: TimeRange;
  label: string;
}[] = [
  { key: "6h", label: "Son 6 saat" },
  { key: "24h", label: "Son 24 saat" },
  { key: "1w", label: "Son 1 hafta" },
  { key: "1m", label: "Son 1 ay" },
  { key: "all", label: "Tüm zamanlar" },
];

interface FeedOptionsSheetProps {
  sortBy: SortOption;
  timeRange: TimeRange;
  onSortChange: (sort: SortOption) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const FeedOptionsSheet = forwardRef<BottomSheet, FeedOptionsSheetProps>(
  function FeedOptionsSheet(
    { sortBy, timeRange, onSortChange, onTimeRangeChange },
    ref
  ) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const [view, setView] = useState<"sort" | "timeRange">("sort");
    const [pendingSort, setPendingSort] = useState<SortOption | null>(null);

    const snapPoints = useMemo(() => ["45%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        setView("sort");
        setPendingSort(null);
      }
    }, []);

    const pendingSortOption = SORT_OPTIONS.find((o) => o.key === pendingSort);
    const currentTimeOption = TIME_RANGE_OPTIONS.find(
      (o) => o.key === timeRange
    );

    const handleSortSelect = (option: (typeof SORT_OPTIONS)[0]) => {
      if (option.hasTimeFilter) {
        setPendingSort(option.key);
        setView("timeRange");
      } else {
        onSortChange(option.key);
        (ref as React.RefObject<BottomSheet>)?.current?.close();
      }
    };

    const handleTimeRangeSelect = (option: (typeof TIME_RANGE_OPTIONS)[0]) => {
      if (pendingSort) {
        onSortChange(pendingSort);
      }
      onTimeRangeChange(option.key);
      (ref as React.RefObject<BottomSheet>)?.current?.close();
    };

    const handleBack = () => {
      setView("sort");
      setPendingSort(null);
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            {view === "timeRange" && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, { color: colors.text }]}>
              {view === "sort"
                ? "Sıralama"
                : `${pendingSortOption?.label} - Zaman Aralığı`}
            </Text>
          </View>

          {view === "sort" && (
            <View style={styles.optionsList}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionItem,
                    sortBy === option.key && {
                      backgroundColor: colors.primary + "15",
                    },
                  ]}
                  onPress={() => handleSortSelect(option)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          sortBy === option.key
                            ? colors.primary + "20"
                            : colors.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={
                        sortBy === option.key
                          ? colors.primary
                          : colors.textMuted
                      }
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color:
                            sortBy === option.key
                              ? colors.primary
                              : colors.text,
                          fontWeight: sortBy === option.key ? "600" : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.hasTimeFilter && sortBy === option.key && (
                      <Text
                        style={[
                          styles.optionSublabel,
                          { color: colors.textMuted },
                        ]}
                      >
                        {currentTimeOption?.label}
                      </Text>
                    )}
                  </View>
                  {sortBy === option.key && !option.hasTimeFilter && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                  {option.hasTimeFilter && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textMuted}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {view === "timeRange" && (
            <View style={styles.optionsList}>
              {TIME_RANGE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionItem,
                    timeRange === option.key && {
                      backgroundColor: colors.primary + "15",
                    },
                  ]}
                  onPress={() => handleTimeRangeSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color:
                          timeRange === option.key
                            ? colors.primary
                            : colors.text,
                        fontWeight: timeRange === option.key ? "600" : "400",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {timeRange === option.key && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    marginBottom: Spacing.sm,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  optionsList: {
    gap: Spacing.xs,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSize.md,
  },
  optionSublabel: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
