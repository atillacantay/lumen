import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPosts } from "@/services/post-service";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { isLoading: userLoading } = useUser();
  const { categories, getCategoryById } = useCategories();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    setIsLoading(true);
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch {
      return "";
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          {
            backgroundColor:
              selectedCategory === null ? colors.primary : colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={() => {
          setSelectedCategory(null);
          setIsLoading(true);
        }}
      >
        <Text
          style={[
            styles.categoryChipText,
            { color: selectedCategory === null ? "#FFF" : colors.text },
          ]}
        >
          Tümü
        </Text>
      </TouchableOpacity>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selectedCategory === cat.id ? cat.color : colors.surface,
              borderColor:
                selectedCategory === cat.id ? cat.color : colors.border,
            },
          ]}
          onPress={() => handleCategoryPress(cat.id)}
        >
          <Text style={styles.categoryIcon}>{cat.emoji}</Text>
          <Text
            style={[
              styles.categoryChipText,
              { color: selectedCategory === cat.id ? "#FFF" : colors.text },
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

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
            <Text style={styles.categoryBadgeText}>
              {category?.name || "Diğer"}
            </Text>
          </View>
          <Text style={[styles.postDate, { color: colors.textMuted }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <Text
          style={[styles.postTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text
          style={[styles.postContent, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.content}
        </Text>

        <View style={styles.postFooter}>
          <View style={styles.authorContainer}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={colors.textMuted}
            />
            <Text style={[styles.authorName, { color: colors.textMuted }]}>
              {item.authorName}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color={colors.hug} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {item.hugsCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {item.commentsCount}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌙</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Henüz paylaşım yok
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        İlk paylaşımı sen yap, derdini anlat!
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/create-post")}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.emptyButtonText}>Paylaşım Yap</Text>
      </TouchableOpacity>
    </View>
  );

  if (userLoading || (isLoading && posts.length === 0)) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.logo, { color: colors.primary }]}>Lumen</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Dertleş, Rahatla 🌙
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/create-post")}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
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
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
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
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: "row",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  postCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryBadgeIcon: {
    fontSize: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFF",
  },
  postDate: {
    fontSize: FontSize.xs,
  },
  postTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  postContent: {
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontSize: FontSize.sm,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: FontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
