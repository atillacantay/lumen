import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

interface CommentSkeletonProps {
  count?: number;
}

export const CommentSkeleton: React.FC<CommentSkeletonProps> = ({
  count = 2,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.card, { backgroundColor: colors.surface }]}
        >
          <View style={styles.row}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <View style={styles.flex}>
              <Skeleton width={80} height={14} borderRadius={4} />
              <Skeleton
                width={50}
                height={10}
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
          <Skeleton
            width="100%"
            height={14}
            borderRadius={4}
            style={{ marginTop: Spacing.sm }}
          />
          <Skeleton
            width="60%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
          <Skeleton
            width={60}
            height={24}
            borderRadius={12}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
