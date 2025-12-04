import {
  ProfileCommentsTab,
  ProfileHeader,
  ProfilePostsTab,
} from "@/components/profile";
import { ProfileSkeleton } from "@/components/skeletons";
import { SortOption, SortPicker } from "@/components/SortPicker";
import { Tab, Tabs } from "@/components/Tabs";
import { Colors } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { getCommentsByUser } from "@/services/comment-service";
import { getPostsByUser } from "@/services/post-service";
import { Comment, Post } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

type TabType = "posts" | "comments";

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

  const postsData = useInfiniteList<Post, PostFetchParams>({
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

  const commentsData = useInfiniteList<Comment, CommentFetchParams>({
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
      badge: postsData.items.length,
    },
    {
      key: "comments",
      label: "Yorumlarım",
      icon: "chatbubble-outline",
      badge: commentsData.items.length,
    },
  ];

  // Loading state
  if (userLoading || (postsData.isLoading && commentsData.isLoading)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <ProfileHeader
        postsCount={postsData.items.length}
        commentsCount={commentsData.items.length}
      />

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
      {activeTab === "posts" && user ? (
        <ProfilePostsTab user={user} postsData={postsData} />
      ) : activeTab === "comments" && user ? (
        <ProfileCommentsTab user={user} commentsData={commentsData} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
