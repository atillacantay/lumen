import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostCard } from "@/components/PostCard";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getCommentsByUser } from "@/services/comment-service";
import { getPostsByUser } from "@/services/post-service";
import { Comment, Post } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [userPosts, userComments] = await Promise.all([
        getPostsByUser(user.id),
        getCommentsByUser(user.id),
      ]);
      setPosts(userPosts);
      setComments(userComments);
    } catch (error) {
      console.error("Kullanıcı verileri yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

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
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "posts" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("posts")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "posts" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Paylaşımlarım
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "comments" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("comments")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "comments"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Yorumlarım
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "posts" ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => router.push(`/post/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Henüz paylaşım yapmadın
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.commentItem, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/post/${item.postId}` as any)}
            >
              <Text style={[styles.commentContent, { color: colors.text }]}>
                {item.content}
              </Text>
              <Text style={[styles.commentMeta, { color: colors.textMuted }]}>
                {item.hugsCount} sarılma
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Henüz yorum yapmadın
              </Text>
            </View>
          }
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
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: FontSize.sm,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 50,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
  },
  commentItem: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  commentContent: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  commentMeta: {
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
  },
});
