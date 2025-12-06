import { Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { getPosts, toggleHug } from "@/services/post-service";
import { Post } from "@/types";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import CategoryHeader from "@/components/explore/CategoryHeader";
import CategoryList from "@/components/explore/CategoryList";
import PostList from "@/components/explore/PostList";
import SearchBar from "@/components/explore/SearchBar";

interface FetchParams {
  categoryId: string | null;
  userId?: string;
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { categories, getCategoryById } = useCategories();
  const { user } = useUser();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCategoryData = selectedCategory
    ? getCategoryById(selectedCategory)
    : null;

  // Memoize params to prevent unnecessary refetches
  const params = useMemo<FetchParams>(
    () => ({ categoryId: selectedCategory, userId: user?.id }),
    [selectedCategory, user?.id]
  );

  // Fetch function for infinite list
  const fetchPosts = useCallback(
    async (cursor: unknown | null, { categoryId, userId }: FetchParams) => {
      if (!categoryId) {
        return { items: [], nextCursor: null };
      }
      const result = await getPosts(
        cursor as any,
        categoryId,
        "newest",
        20,
        userId
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
    enabled: !!selectedCategory,
  });

  // Filter posts by search
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
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
    } catch {
      // Silently fail
    }
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore && !searchQuery) {
      loadMore();
    }
  };

  // Category list view
  if (!selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CategoryHeader
          title="Keşfet"
          subtitle="Bir kategori seç"
          colors={colors}
        />
        <CategoryList
          categories={categories}
          onSelect={(id) => setSelectedCategory(id)}
          colors={colors}
        />
      </View>
    );
  }

  // Posts view (when category selected)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CategoryHeader
        title={`${selectedCategoryData?.emoji} ${selectedCategoryData?.name}`}
        subtitle={`${filteredPosts.length} paylaşım`}
        onBack={() => {
          setSelectedCategory(null);
          setSearchQuery("");
        }}
        colors={colors}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
        colors={colors}
      />

      <PostList
        posts={filteredPosts}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onEndReached={handleEndReached}
        onHug={handleHug}
        colors={colors}
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
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  postList: {
    padding: Spacing.md,
  },
});
