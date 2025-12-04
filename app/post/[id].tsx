import { CommentList } from "@/components/CommentList";
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
  createComment,
  getCommentsByPost,
  toggleCommentHug,
} from "@/services/comment-service";
import { getPostById, toggleHug } from "@/services/post-service";
import { Comment, Post } from "@/types";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useUser();
  const { getCategoryById } = useCategories();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch post and comments
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
      } catch (error) {
        console.error("Veri yüklenemedi:", error);
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
    } catch (error) {
      console.error("Sarılma başarısız:", error);
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
    } catch (error) {
      console.error("Yorum sarılma başarısız:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !post) return;

    setSubmitting(true);
    try {
      const comment = await createComment({
        postId: post.id,
        content: newComment.trim(),
        authorId: user.id,
        authorName: user.anonymousName,
      });
      setComments((prev) => [...prev, comment]);
      setPost((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null
      );
      setNewComment("");
    } catch {
      Alert.alert("Hata", "Yorum gönderilemedi.");
    } finally {
      setSubmitting(false);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <PostDetailHeader
          title={category?.name || "Paylaşım"}
          emoji={category?.emoji}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
            onHugComment={handleHugComment}
            onCommentsChange={setComments}
          />
        </ScrollView>

        {/* Comment Input */}
        <CommentInput
          value={newComment}
          onChangeText={setNewComment}
          onSubmit={handleSubmitComment}
          isSubmitting={submitting}
          bottomInset={insets.bottom}
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
    paddingBottom: 100,
  },
});
