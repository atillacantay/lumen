import { FeedOptionsSheet } from "@/components/FeedOptionsSheet";
import HomeEmptyState from "@/components/HomeEmptyState";
import HomeFilters from "@/components/HomeFilters";
import HomeHeader from "@/components/HomeHeader";
import { ListFooter } from "@/components/ListFooter";
import { PostCard } from "@/components/PostCard";
import { PostSkeleton } from "@/components/skeletons";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import {
  trackPostHugged,
  trackPullToRefresh,
  trackSortChanged,
} from "@/services/analytics-service";
import { getPosts, SortOption, toggleHug } from "@/services/post-service";
import { Post, TimeRange } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

const SORT_OPTIONS: {
  key: SortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "newest", label: "En Yeni", icon: "time-outline" },
  { key: "popular", label: "Popüler", icon: "heart" },
  { key: "mostComments", label: "En Çok Yorum", icon: "chatbubble" },
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

interface FetchParams {
  sortBy: SortOption;
  userId?: string;
  timeRange: TimeRange;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Bottom Sheet ref
  const feedOptionsRef = useRef<BottomSheet>(null);

  // Time filter is not used when "Newest" is selected
  const effectiveTimeRange = sortBy === "newest" ? "all" : timeRange;

  // Get current sort option for display
  const currentSortOption = SORT_OPTIONS.find((o) => o.key === sortBy);
  const currentTimeOption = TIME_RANGE_OPTIONS.find((o) => o.key === timeRange);

  // Memoize params to prevent unnecessary refetches
  const params = useMemo<FetchParams>(
    () => ({ sortBy, userId: user?.id, timeRange: effectiveTimeRange }),
    [sortBy, user?.id, effectiveTimeRange]
  );

  // Fetch function for infinite list
  const fetchPosts = useCallback(
    async (
      cursor: unknown | null,
      { sortBy, userId, timeRange }: FetchParams
    ) => {
      const result = await getPosts(
        cursor as any,
        undefined,
        sortBy,
        20,
        userId,
        timeRange
      );
      return {
        items: result.posts,
        nextCursor: result.lastDoc,
      };
    },
    []
  );

  const {
    items: posts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    updateItem,
  } = useInfiniteList<Post, FetchParams>({
    fetchFn: fetchPosts,
    params,
    pageSize: 20,
    enabled: !userLoading,
  });

  const handleHug = async (postId: string) => {
    if (!user) return;

    try {
      const nowHugged = await toggleHug(postId, user.id, user.anonymousName);
      updateItem(postId, (post) => ({
        ...post,
        isHugged: nowHugged,
        hugsCount: post.hugsCount + (nowHugged ? 1 : -1),
      }));

      // Track analytics
      if (nowHugged) {
        const post = posts.find((p) => p.id === postId);
        trackPostHugged({
          postId,
          authorId: post?.authorId || "unknown",
          category: post?.categoryId || "unknown",
        });
      }
    } catch {
      // Silently fail
    }
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  // Loading state
  if (userLoading || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HomeHeader onCreatePress={() => {}} />
        <HomeFilters sortLabel="En Yeni" isDisabled />
        <View style={styles.listContent}>
          <PostSkeleton count={3} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader onCreatePress={() => router.push("/create-post")} />
      <HomeFilters
        sortLabel={currentSortOption?.label || "En Yeni"}
        timeLabel={sortBy !== "newest" ? currentTimeOption?.label : undefined}
        onPress={() => feedOptionsRef.current?.expand()}
      />

      {/* Posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              trackPullToRefresh("home_feed");
              refresh();
            }}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push(`/post/${item.id}`)}
            onHug={() => handleHug(item.id)}
          />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
        ListEmptyComponent={() => (
          <HomeEmptyState onCreate={() => router.push("/create-post")} />
        )}
      />

      {/* Feed Options Bottom Sheet */}
      <FeedOptionsSheet
        ref={feedOptionsRef}
        sortBy={sortBy}
        timeRange={timeRange}
        onSortChange={(newSort) => {
          trackSortChanged({
            newSort,
            previousSort: sortBy,
            screen: "Feed",
          });
          setSortBy(newSort);
        }}
        onTimeRangeChange={setTimeRange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  // Filter Button
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  filterButtonText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // List
  listContent: {
    padding: Spacing.md,
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginTop: Spacing.md,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
