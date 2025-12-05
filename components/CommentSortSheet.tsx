import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CommentSortOption } from "@/services/comment-service";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import React, { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SORT_OPTIONS: {
  key: CommentSortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "newest", label: "Yeniden Eskiye", icon: "time" },
  { key: "oldest", label: "Eskiden Yeniye", icon: "time-outline" },
  { key: "popular", label: "Popüler", icon: "heart" },
];

interface CommentSortSheetProps {
  sortBy: CommentSortOption;
  onSortChange: (sort: CommentSortOption) => void;
}

export const CommentSortSheet = forwardRef<BottomSheet, CommentSortSheetProps>(
  function CommentSortSheet({ sortBy, onSortChange }, ref) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const snapPoints = useMemo(() => ["40%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    const handleSortSelect = (option: (typeof SORT_OPTIONS)[0]) => {
      onSortChange(option.key);
      (ref as React.RefObject<BottomSheet>)?.current?.close();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Yorumları Sırala
            </Text>
          </View>

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
                      sortBy === option.key ? colors.primary : colors.textMuted
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color:
                        sortBy === option.key ? colors.primary : colors.text,
                      fontWeight: sortBy === option.key ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    marginBottom: Spacing.sm,
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
  optionLabel: {
    fontSize: FontSize.md,
  },
});
