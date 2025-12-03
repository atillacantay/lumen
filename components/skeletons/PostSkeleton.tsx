import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

interface PostSkeletonProps {
  count?: number;
}

export const PostSkeleton: React.FC<PostSkeletonProps> = ({ count = 3 }) => {
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
            <Skeleton width={36} height={36} borderRadius={8} />
            <View style={styles.flex}>
              <Skeleton width="60%" height={16} borderRadius={4} />
              <Skeleton
                width="40%"
                height={12}
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
          <View style={{ marginTop: Spacing.sm }}>
            <Skeleton width="100%" height={14} borderRadius={4} />
            <Skeleton
              width="80%"
              height={14}
              borderRadius={4}
              style={{ marginTop: 6 }}
            />
          </View>
          <View style={[styles.row, { marginTop: Spacing.sm }]}>
            <Skeleton width={50} height={14} borderRadius={4} />
            <Skeleton width={50} height={14} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
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
