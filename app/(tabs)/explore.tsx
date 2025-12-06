import { ListFooter } from "@/components/ListFooter";
import { PostCard } from "@/components/PostCard";
import { PostSkeleton } from "@/components/skeletons";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { getPosts, toggleHug } from "@/services/post-service";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FetchParams {
  categoryId: string | null;
  userId?: string;
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
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
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Keşfet
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Bir kategori seç
          </Text>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryItem, { backgroundColor: colors.surface }]}
              onPress={() => setSelectedCategory(item.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Posts view (when category selected)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setSelectedCategory(null);
            setSearchQuery("");
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {selectedCategoryData?.emoji} {selectedCategoryData?.name}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {filteredPosts.length} paylaşım
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Paylaşımlarda ara..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Posts */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={selectedCategoryData?.color || colors.primary}
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            showCategory={false}
            onPress={() => router.push(`/post/${item.id}`)}
            onHug={() => handleHug(item.id)}
          />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
        ListEmptyComponent={() =>
          isLoading ? (
            <PostSkeleton count={3} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Bu kategoride henüz paylaşım yok
              </Text>
            </View>
          )
        }
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
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: 2,
  },
  // Category List
  categoryList: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  // Post List
  postList: {
    padding: Spacing.md,
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
