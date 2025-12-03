import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CommentSkeleton } from "./CommentSkeleton";
import { Skeleton } from "./Skeleton";

export const PostDetailSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Author */}
        <View style={styles.row}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={styles.flex}>
            <Skeleton width={100} height={16} borderRadius={4} />
            <Skeleton
              width={60}
              height={12}
              borderRadius={4}
              style={{ marginTop: 4 }}
            />
          </View>
        </View>
        {/* Title */}
        <Skeleton
          width="100%"
          height={24}
          borderRadius={4}
          style={{ marginTop: Spacing.md }}
        />
        {/* Content */}
        <Skeleton
          width="100%"
          height={80}
          borderRadius={4}
          style={{ marginTop: Spacing.sm }}
        />
        {/* Hug Button */}
        <Skeleton
          width="100%"
          height={48}
          borderRadius={BorderRadius.md}
          style={{ marginTop: Spacing.md }}
        />
      </View>

      {/* Comments Header */}
      <Skeleton
        width={120}
        height={20}
        borderRadius={4}
        style={{ marginTop: Spacing.lg }}
      />

      {/* Comment Skeletons */}
      <CommentSkeleton count={2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
