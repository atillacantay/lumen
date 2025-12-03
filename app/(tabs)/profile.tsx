import { CommentCard } from "@/components/CommentCard";
import { PostCard } from "@/components/PostCard";
import { ProfileSkeleton } from "@/components/skeletons";
import { Tab, Tabs } from "@/components/Tabs";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getCommentsByUser } from "@/services/comment-service";
import { getPostsByUser } from "@/services/post-service";
import { Comment, Post } from "@/types";
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

type TabType = "posts" | "comments";

// Empty state configuration
const emptyStates: Record<TabType, { emoji: string; text: string }> = {
  posts: { emoji: "📝", text: "Henüz paylaşım yapmadın" },
  comments: { emoji: "💬", text: "Henüz yorum yapmadın" },
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab configuration
  const tabs: Tab<TabType>[] = [
    {
      key: "posts",
      label: "Paylaşımlarım",
      icon: "document-text-outline",
      badge: posts.length,
    },
    {
      key: "comments",
      label: "Yorumlarım",
      icon: "chatbubble-outline",
      badge: comments.length,
    },
  ];

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [userPosts, userComments] = await Promise.all([
          getPostsByUser(user.id, user.id),
          getCommentsByUser(user.id, user.id),
        ]);
        setPosts(userPosts);
        setComments(userComments);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const [userPosts, userComments] = await Promise.all([
        getPostsByUser(user.id, user.id),
        getCommentsByUser(user.id, user.id),
      ]);
      setPosts(userPosts);
      setComments(userComments);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (userLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ProfileSkeleton />
      </View>
    );
  }

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{emptyStates[activeTab].emoji}</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {emptyStates[activeTab].text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.anonymousName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>
          {user?.anonymousName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Anonim Kullanıcı
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {posts.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Paylaşım
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {comments.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Yorum
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showIcons={true}
      />

      {/* Content */}
      {activeTab === "posts" ? (
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
              onPress={() => router.push(`/post/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={EmptyState}
        />
      ) : (
        <FlatList
          data={comments}
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
            <TouchableOpacity
              onPress={() => router.push(`/post/${item.postId}` as any)}
              activeOpacity={0.8}
            >
              <CommentCard comment={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={EmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.xxl,
    fontWeight: "bold",
  },
  username: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
