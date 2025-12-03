import { CommentList } from "@/components/CommentList";
import { PostDetailSkeleton, Skeleton } from "@/components/skeletons";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
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
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();
  const { getCategoryById } = useCategories();

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
      const nowHugged = await toggleHug(post.id, user.id);
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
      const nowHugged = await toggleCommentHug(commentId, user.id);

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

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch {
      return "";
    }
  };

  const category = post ? getCategoryById(post.categoryId) : null;

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Skeleton width={120} height={20} borderRadius={BorderRadius.sm} />
          <View style={styles.headerSpacer} />
        </View>
        <PostDetailSkeleton />
      </View>
    );
  }

  // Error state
  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Hata</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Post bulunamadı
          </Text>
        </View>
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
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {category?.emoji} {category?.name || "Paylaşım"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Post */}
          <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
            {/* Author */}
            <View style={styles.authorRow}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: category?.color || colors.primary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {post.authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {post.authorName}
                </Text>
                <Text style={[styles.timeAgo, { color: colors.textMuted }]}>
                  {formatDate(post.createdAt)}
                </Text>
              </View>
            </View>

            {/* Content */}
            <Text style={[styles.postTitle, { color: colors.text }]}>
              {post.title}
            </Text>
            <Text style={[styles.postContent, { color: colors.textSecondary }]}>
              {post.content}
            </Text>

            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}

            {/* Hug Button */}
            <TouchableOpacity
              onPress={handleHugPost}
              style={[
                styles.hugButton,
                { backgroundColor: post.isHugged ? colors.hug : colors.border },
              ]}
            >
              <Text style={styles.hugEmoji}>{post.isHugged ? "🤗" : "🫂"}</Text>
              <Text
                style={[
                  styles.hugText,
                  { color: post.isHugged ? "#FFF" : colors.text },
                ]}
              >
                {post.hugsCount} sarılma
              </Text>
            </TouchableOpacity>
          </View>

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
        <View
          style={[styles.inputContainer, { backgroundColor: colors.surface }]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, color: colors.text },
            ]}
            placeholder="Destek ol, yorum yaz..."
            placeholderTextColor={colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: newComment.trim()
                  ? colors.primary
                  : colors.border,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: FontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  postCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: "#FFF",
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  postTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
  },
  postContent: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  hugButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  hugEmoji: {
    fontSize: 22,
  },
  hugText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
