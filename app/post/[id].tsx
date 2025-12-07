import { AdBanner } from "@/components/AdBanner";
import { CommentList } from "@/components/CommentList";
import { CommentSortSheet } from "@/components/CommentSortSheet";
import {
  CommentInput,
  PostDetailCard,
  PostDetailError,
  PostDetailHeader,
} from "@/components/post-detail";
import { PostDetailSkeleton } from "@/components/skeletons";
import { Colors, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  trackCommentHugged,
  trackPostViewed,
} from "@/services/analytics-service";
import {
  CommentSortOption,
  getCommentsByPost,
  toggleCommentHug,
} from "@/services/comment-service";
import { getPostById, toggleHug } from "@/services/post-service";
import { Comment, Post } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useUser();
  const { getCategoryById } = useCategories();
  const insets = useSafeAreaInsets();
  const sortSheetRef = useRef<BottomSheet>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentSortBy, setCommentSortBy] =
    useState<CommentSortOption>("oldest");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [fetchedPost, fetchedComments] = await Promise.all([
          getPostById(id, user?.id),
          getCommentsByPost(id, "oldest", user?.id),
        ]);

        setPost(fetchedPost);
        setComments(fetchedComments);

        // Track post view
        if (fetchedPost) {
          trackPostViewed({
            postId: fetchedPost.id,
            authorId: fetchedPost.authorId,
            category: fetchedPost.categoryId,
          });
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleHugPost = async () => {
    if (!user || !post) return;

    try {
      const nowHugged = await toggleHug(post.id, user.id, user.anonymousName);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isHugged: nowHugged,
              hugsCount: prev.hugsCount + (nowHugged ? 1 : -1),
            }
          : null
      );
    } catch {
      // Silently fail
    }
  };

  const handleHugComment = async (commentId: string) => {
    if (!user) return;

    try {
      const nowHugged = await toggleCommentHug(
        commentId,
        user.id,
        user.anonymousName
      );

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isHugged: nowHugged,
                hugsCount: c.hugsCount + (nowHugged ? 1 : -1),
              }
            : c
        )
      );

      // Track comment hug
      if (nowHugged) {
        trackCommentHugged({
          commentId,
          postId: post?.id || "unknown",
        });
      }
    } catch {
      // Silently fail
    }
  };

  const handleRefresh = async () => {
    if (!id) return;

    setRefreshing(true);
    try {
      const [fetchedPost, fetchedComments] = await Promise.all([
        getPostById(id, user?.id),
        getCommentsByPost(id, commentSortBy, user?.id),
      ]);

      setPost(fetchedPost);
      setComments(fetchedComments);
    } catch {
      // Silently fail
    } finally {
      setRefreshing(false);
    }
  };

  const handleCommentSortChange = async (newSort: CommentSortOption) => {
    setCommentSortBy(newSort);
    try {
      const sortedComments = await getCommentsByPost(id, newSort, user?.id);
      setComments(sortedComments);
    } catch {
      // Silently fail
    }
  };

  const category = post ? getCategoryById(post.categoryId) : null;

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PostDetailHeader title="Yükleniyor..." />
        <PostDetailSkeleton />
      </View>
    );
  }

  // Error state
  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PostDetailHeader title="Hata" />
        <PostDetailError />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <PostDetailHeader
          title={category?.name || "Paylaşım"}
          emoji={category?.emoji}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Post Card */}
          <PostDetailCard
            post={post}
            category={category}
            onHug={handleHugPost}
          />

          {/* Comments */}
          <CommentList
            postId={post.id}
            comments={comments}
            userId={user?.id}
            sortBy={commentSortBy}
            onHugComment={handleHugComment}
            onCommentsChange={setComments}
            onOpenSortSheet={() => sortSheetRef.current?.expand()}
          />

          {/* Ad Banner */}
          <AdBanner />
        </ScrollView>

        {/* Comment Input */}
        <CommentInput
          onPress={() => {
            if (id) {
              router.push(`/post/${id}/comment`);
            }
          }}
          bottomInset={insets.bottom}
        />

        {/* Comment Sort Sheet */}
        <CommentSortSheet
          ref={sortSheetRef}
          sortBy={commentSortBy}
          onSortChange={handleCommentSortChange}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  adBanner: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
