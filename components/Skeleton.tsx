import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ============ Post Skeleton ============
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

// ============ Post Detail Skeleton ============
export const PostDetailSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.detailContainer}>
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

// ============ Comment Skeleton ============
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

// ============ Profile Skeleton ============
export const ProfileSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View>
      {/* Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
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
      <View style={styles.profileContent}>
        <PostSkeleton count={2} />
      </View>
    </View>
  );
};

// ============ Category Skeleton ============
interface CategorySkeletonProps {
  count?: number;
}

export const CategorySkeleton: React.FC<CategorySkeletonProps> = ({
  count = 5,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.categoryItem, { backgroundColor: colors.surface }]}
        >
          <Skeleton width={44} height={44} borderRadius={BorderRadius.md} />
          <Skeleton
            width={120}
            height={18}
            borderRadius={4}
            style={styles.flex}
          />
          <Skeleton width={20} height={20} borderRadius={4} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  detailContainer: {
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
  // Profile
  profileHeader: {
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
  profileContent: {
    padding: Spacing.md,
  },
  // Category
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
});
