import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPosts } from "@/services/post-service";
import { Category, Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const {
    categories,
    getCategoryById,
    isLoading: categoriesLoading,
  } = useCategories();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchPosts = useCallback(async (categoryId?: string) => {
    try {
      const result = await getPosts(undefined, categoryId || undefined);
      setPosts(result.posts);
    } catch (error) {
      console.error("Postlar yüklenemedi:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(selectedCategory || undefined);
  }, [selectedCategory, fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(selectedCategory || undefined);
  }, [selectedCategory, fetchPosts]);

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  });

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch {
      return "";
    }
  };

  const renderCategoryCard = ({ item }: { item: Category }) => {
    const categoryPosts = posts.filter((p) => p.categoryId === item.id);
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: isSelected ? item.color : colors.surface,
            borderColor: item.color,
          },
        ]}
        onPress={() => {
          if (isSelected) {
            setSelectedCategory(null);
          } else {
            setSelectedCategory(item.id);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryCardIcon}>{item.emoji}</Text>
        <Text
          style={[
            styles.categoryCardName,
            { color: isSelected ? "#FFF" : colors.text },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.categoryCardCount,
            { color: isSelected ? "rgba(255,255,255,0.8)" : colors.textMuted },
          ]}
        >
          {categoryPosts.length} paylaşım
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPostCard = ({ item }: { item: Post }) => {
    const category = getCategoryById(item.categoryId);

    return (
      <TouchableOpacity
        style={[styles.postCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/post/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.postHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category?.color || colors.primary },
            ]}
          >
            <Text style={styles.categoryBadgeIcon}>
              {category?.emoji || "💭"}
            </Text>
          </View>
          <View style={styles.postHeaderText}>
            <Text
              style={[styles.postTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.postMeta, { color: colors.textMuted }]}>
              {item.authorName} • {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.postContent, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.content}
        </Text>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={14} color={colors.hug} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>
              {item.hugsCount}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.statText, { color: colors.textMuted }]}>
              {item.commentsCount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Keşfet</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Kategorilere göz at, dertlere derman ol
        </Text>
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Dertlerde ara..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={selectedCategory ? filteredPosts : []}
        keyExtractor={(item) => item.id}
        renderItem={renderPostCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Categories Grid */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Kategoriler
            </Text>
            {categoriesLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: Spacing.md }}
              />
            ) : (
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <View key={cat.id} style={styles.categoryGridItem}>
                    {renderCategoryCard({ item: cat })}
                  </View>
                ))}
              </View>
            )}

            {/* Selected Category Posts */}
            {selectedCategory && (
              <View style={styles.selectedCategoryHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {getCategoryById(selectedCategory)?.emoji}{" "}
                  {getCategoryById(selectedCategory)?.name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Text style={[styles.clearButton, { color: colors.primary }]}>
                    Temizle
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        ListEmptyComponent={() =>
          selectedCategory ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Bu kategoride henüz paylaşım yok
              </Text>
            </View>
          ) : (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                👆 Bir kategori seçerek paylaşımları görüntüleyebilirsin
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: 4,
  },
  listContent: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  categoryGridItem: {
    width: "50%",
    padding: Spacing.xs,
  },
  categoryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    gap: Spacing.xs,
  },
  categoryCardIcon: {
    fontSize: 32,
  },
  categoryCardName: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  categoryCardCount: {
    fontSize: FontSize.xs,
  },
  selectedCategoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  clearButton: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  postCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadgeIcon: {
    fontSize: 18,
  },
  postHeaderText: {
    flex: 1,
  },
  postTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  postMeta: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  postContent: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  postStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: FontSize.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
  hintContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  hintText: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
