import { Colors } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { getPosts, toggleHug } from "@/services/post-service";
import { Post } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import CategoryHeader from "@/components/explore/CategoryHeader";
import PostList from "@/components/explore/PostList";
import SearchBar from "@/components/explore/SearchBar";

interface FetchParams {
  categoryId: string | null;
  userId?: string;
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { getCategoryById } = useCategories();
  const { user } = useUser();

  const category = id ? getCategoryById(id) : null;

  const [searchQuery, setSearchQuery] = useState("");

  const params = useMemo<FetchParams>(
    () => ({ categoryId: id ?? null, userId: user?.id }),
    [id, user?.id]
  );

  const fetchPosts = useCallback(
    async (cursor: unknown | null, { categoryId, userId }: FetchParams) => {
      if (!categoryId) return { items: [], nextCursor: null };
      const result = await getPosts(
        cursor as any,
        categoryId,
        "newest",
        20,
        userId
      );
      return { items: result.posts, nextCursor: result.lastDoc };
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
    enabled: !!id,
  });

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q)
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
      // ignore
    }
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore && !searchQuery) loadMore();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CategoryHeader
        title={`${category?.emoji ?? ""} ${category?.name ?? "Kategori"}`}
        subtitle={`${filteredPosts.length} paylaşım`}
        onBack={() => router.back()}
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
  container: { flex: 1 },
});
