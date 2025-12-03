import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { PostSkeleton } from "./PostSkeleton";
import { Skeleton } from "./Skeleton";

export const ProfileSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <Skeleton
          width={120}
          height={24}
          borderRadius={4}
          style={{ marginTop: Spacing.md }}
        />
        <Skeleton
          width={100}
          height={16}
          borderRadius={4}
          style={{ marginTop: Spacing.xs }}
        />
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Skeleton width={40} height={24} borderRadius={4} />
            <Skeleton
              width={60}
              height={14}
              borderRadius={4}
              style={{ marginTop: Spacing.xs }}
            />
          </View>
          <View style={styles.stat}>
            <Skeleton width={40} height={24} borderRadius={4} />
            <Skeleton
              width={50}
              height={14}
              borderRadius={4}
              style={{ marginTop: Spacing.xs }}
            />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <Skeleton width={100} height={20} borderRadius={4} />
        <Skeleton width={90} height={20} borderRadius={4} />
      </View>

      {/* Posts */}
      <View style={styles.content}>
        <PostSkeleton count={2} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  stat: {
    alignItems: "center",
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
  },
  content: {
    padding: Spacing.md,
  },
});
