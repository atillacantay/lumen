import { PostCard } from "@/components/PostCard";
import { PostSkeleton } from "@/components/skeletons";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPosts, SortOption, toggleHug } from "@/services/post-service";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: "newest", label: "En Yeni", icon: "time-outline" },
  { key: "popular", label: "Popüler", icon: "heart" },
  { key: "mostComments", label: "En Çok Yorum", icon: "chatbubble" },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Fetch posts when sortBy changes
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const result = await getPosts(
          undefined,
          undefined,
          sortBy,
          undefined,
          user?.id
        );
        setPosts(result.posts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [sortBy, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await getPosts(
        undefined,
        undefined,
        sortBy,
        undefined,
        user?.id
      );
      setPosts(result.posts);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleHug = async (postId: string) => {
    if (!user) return;

    try {
      const nowHugged = await toggleHug(postId, user.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isHugged: nowHugged,
                hugsCount: p.hugsCount + (nowHugged ? 1 : -1),
              }
            : p
        )
      );
    } catch (error) {
      console.error("Hug error:", error);
    }
  };

  // Loading state
  if (userLoading || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
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
        <View style={styles.listContent}>
          <PostSkeleton count={3} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
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

      {/* Sort Options */}
      <View style={[styles.sortContainer, { backgroundColor: colors.surface }]}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && {
                backgroundColor: colors.primary + "20",
              },
            ]}
            onPress={() => setSortBy(option.key)}
          >
            <Ionicons
              name={option.icon as any}
              size={14}
              color={sortBy === option.key ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.sortText,
                {
                  color:
                    sortBy === option.key ? colors.primary : colors.textMuted,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
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
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push(`/post/${item.id}`)}
            onHug={() => handleHug(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌙</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Henüz paylaşım yok
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              İlk paylaşımı sen yap!
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/create-post")}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.emptyButtonText}>Paylaşım Yap</Text>
            </TouchableOpacity>
          </View>
        )}
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
  // Sort
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  sortText: {
    fontSize: FontSize.xs,
    fontWeight: "500",
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
