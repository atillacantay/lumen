import { CommentCard } from "@/components/CommentCard";
import { ListFooter } from "@/components/ListFooter";
import { PostCard } from "@/components/PostCard";
import { ProfileSkeleton } from "@/components/skeletons";
import { SortOption, SortPicker } from "@/components/SortPicker";
import { Tab, Tabs } from "@/components/Tabs";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import {
  getCommentsByUser,
  toggleCommentHug,
} from "@/services/comment-service";
import { getPostsByUser, toggleHug } from "@/services/post-service";
import { Comment, Post } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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

interface PostFetchParams {
  authorId: string;
  userId: string;
  sortBy: SortOption;
}

interface CommentFetchParams {
  authorId: string;
  userId: string;
  sortBy: SortOption;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [postsSortBy, setPostsSortBy] = useState<SortOption>("newest");
  const [commentsSortBy, setCommentsSortBy] = useState<SortOption>("newest");

  // Posts infinite list
  const postParams = useMemo<PostFetchParams>(
    () => ({
      authorId: user?.id || "",
      userId: user?.id || "",
      sortBy: postsSortBy,
    }),
    [user?.id, postsSortBy]
  );

  const fetchPosts = useCallback(
    async (
      cursor: unknown | null,
      { authorId, userId, sortBy }: PostFetchParams
    ) => {
      if (!authorId) return { items: [], nextCursor: null };
      const result = await getPostsByUser(
        authorId,
        userId,
        cursor as any,
        20,
        sortBy
      );
      return { items: result.posts, nextCursor: result.lastDoc };
    },
    []
  );

  const {
    items: posts,
    isLoading: postsLoading,
    isLoadingMore: postsLoadingMore,
    isRefreshing: postsRefreshing,
    hasMore: postsHasMore,
    loadMore: loadMorePosts,
    refresh: refreshPosts,
    updateItem: updatePost,
  } = useInfiniteList<Post, PostFetchParams>({
    fetchFn: fetchPosts,
    params: postParams,
    pageSize: 20,
    enabled: !!user?.id,
  });

  // Comments infinite list
  const commentParams = useMemo<CommentFetchParams>(
    () => ({
      authorId: user?.id || "",
      userId: user?.id || "",
      sortBy: commentsSortBy,
    }),
    [user?.id, commentsSortBy]
  );

  const fetchComments = useCallback(
    async (
      cursor: unknown | null,
      { authorId, userId, sortBy }: CommentFetchParams
    ) => {
      if (!authorId) return { items: [], nextCursor: null };
      const result = await getCommentsByUser(
        authorId,
        userId,
        cursor as any,
        20,
        sortBy
      );
      return { items: result.comments, nextCursor: result.lastDoc };
    },
    []
  );

  const {
    items: comments,
    isLoading: commentsLoading,
    isLoadingMore: commentsLoadingMore,
    isRefreshing: commentsRefreshing,
    hasMore: commentsHasMore,
    loadMore: loadMoreComments,
    refresh: refreshComments,
    updateItem: updateComment,
  } = useInfiniteList<Comment, CommentFetchParams>({
    fetchFn: fetchComments,
    params: commentParams,
    pageSize: 20,
    enabled: !!user?.id,
  });

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

  const handleHugPost = async (postId: string) => {
    if (!user) return;
    try {
      const nowHugged = await toggleHug(postId, user.id);
      updatePost(postId, (post) => ({
        ...post,
        isHugged: nowHugged,
        hugsCount: post.hugsCount + (nowHugged ? 1 : -1),
      }));
    } catch (error) {
      console.error("Hug error:", error);
    }
  };

  const handleHugComment = async (commentId: string) => {
    if (!user) return;
    try {
      const nowHugged = await toggleCommentHug(commentId, user.id);
      updateComment(commentId, (comment) => ({
        ...comment,
        isHugged: nowHugged,
        hugsCount: comment.hugsCount + (nowHugged ? 1 : -1),
      }));
    } catch (error) {
      console.error("Comment hug error:", error);
    }
  };

  const handlePostsEndReached = () => {
    if (postsHasMore && !postsLoadingMore) {
      loadMorePosts();
    }
  };

  const handleCommentsEndReached = () => {
    if (commentsHasMore && !commentsLoadingMore) {
      loadMoreComments();
    }
  };

  // Loading state
  if (userLoading || (postsLoading && commentsLoading)) {
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

      {/* Sort Picker */}
      <SortPicker
        value={activeTab === "posts" ? postsSortBy : commentsSortBy}
        onChange={activeTab === "posts" ? setPostsSortBy : setCommentsSortBy}
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
              refreshing={postsRefreshing}
              onRefresh={refreshPosts}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => router.push(`/post/${item.id}` as any)}
              onHug={() => handleHugPost(item.id)}
            />
          )}
          onEndReached={handlePostsEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<ListFooter isLoadingMore={postsLoadingMore} />}
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
              refreshing={commentsRefreshing}
              onRefresh={refreshComments}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/post/${item.postId}` as any)}
              activeOpacity={0.8}
            >
              <CommentCard
                comment={item}
                isHugged={item.isHugged}
                onHug={() => handleHugComment(item.id)}
              />
            </TouchableOpacity>
          )}
          onEndReached={handleCommentsEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <ListFooter isLoadingMore={commentsLoadingMore} />
          }
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
