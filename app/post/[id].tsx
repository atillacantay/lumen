import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  createComment,
  getCommentsByPost,
  hasUserHuggedComment,
  toggleCommentHug,
} from "@/services/comment-service";
import { getPostById, hasUserHugged, toggleHug } from "@/services/post-service";
import { Comment, Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isHugged, setIsHugged] = useState(false);
  const [huggedComments, setHuggedComments] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [fetchedPost, fetchedComments] = await Promise.all([
        getPostById(id),
        getCommentsByPost(id),
      ]);

      if (fetchedPost) {
        setPost(fetchedPost);

        if (user) {
          const hugged = await hasUserHugged(fetchedPost.id, user.id);
          setIsHugged(hugged);
        }
      }

      setComments(fetchedComments);

      // Check hugged status for comments
      if (user && fetchedComments.length > 0) {
        const huggedSet = new Set<string>();
        for (const comment of fetchedComments) {
          const hugged = await hasUserHuggedComment(comment.id, user.id);
          if (hugged) huggedSet.add(comment.id);
        }
        setHuggedComments(huggedSet);
      }
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHugPost = async () => {
    if (!user || !post) return;

    try {
      const nowHugged = await toggleHug(post.id, user.id);
      setIsHugged(nowHugged);
      setPost((prev) =>
        prev
          ? { ...prev, hugsCount: prev.hugsCount + (nowHugged ? 1 : -1) }
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

      setHuggedComments((prev) => {
        const newSet = new Set(prev);
        if (nowHugged) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, hugsCount: c.hugsCount + (nowHugged ? 1 : -1) }
            : c
        )
      );
    } catch (error) {
      console.error("Yorum sarılma başarısız:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Hata", "Yorum boş olamaz.");
      return;
    }
    if (!user || !post) return;

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
    } catch (error) {
      console.error("Yorum gönderilemedi:", error);
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

  if (loading) {
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

  if (!post) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Post bulunamadı
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>
            Geri Dön
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = getCategoryById(post.categoryId);

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
            {category?.name || "Paylaşım"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Post Content */}
          <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
            {/* Author Info */}
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
              {category && (
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.emoji}</Text>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </View>
              )}
            </View>

            {/* Title & Content */}
            <Text style={[styles.postTitle, { color: colors.text }]}>
              {post.title}
            </Text>
            <Text style={[styles.postContent, { color: colors.textSecondary }]}>
              {post.content}
            </Text>

            {/* Image */}
            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}

            {/* Hug Button */}
            <TouchableOpacity
              onPress={handleHugPost}
              style={[
                styles.hugButton,
                {
                  backgroundColor: isHugged ? colors.hug : colors.border,
                },
              ]}
            >
              <Text style={styles.hugEmoji}>{isHugged ? "🤗" : "🫂"}</Text>
              <Text
                style={[
                  styles.hugText,
                  { color: isHugged ? "#FFF" : colors.text },
                ]}
              >
                {post.hugsCount} kişi sarıldı
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>
              💬 Yorumlar ({post.commentsCount})
            </Text>

            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <Text
                  style={[styles.noCommentsText, { color: colors.textMuted }]}
                >
                  Henüz yorum yok. İlk yorumu sen yap!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View
                  key={comment.id}
                  style={[
                    styles.commentCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <View
                      style={[
                        styles.commentAvatar,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.commentAvatarText}>
                        {comment.authorName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentAuthorInfo}>
                      <Text
                        style={[
                          styles.commentAuthorName,
                          { color: colors.text },
                        ]}
                      >
                        {comment.authorName}
                      </Text>
                      <Text
                        style={[
                          styles.commentTime,
                          { color: colors.textMuted },
                        ]}
                      >
                        {formatDate(comment.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.commentContent, { color: colors.text }]}>
                    {comment.content}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleHugComment(comment.id)}
                    style={[
                      styles.commentHugButton,
                      {
                        backgroundColor: huggedComments.has(comment.id)
                          ? colors.hug + "20"
                          : "transparent",
                      },
                    ]}
                  >
                    <Text style={styles.commentHugEmoji}>
                      {huggedComments.has(comment.id) ? "🤗" : "🫂"}
                    </Text>
                    <Text
                      style={[
                        styles.commentHugText,
                        {
                          color: huggedComments.has(comment.id)
                            ? colors.hug
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {comment.hugsCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View
          style={[
            styles.commentInputContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <TextInput
            style={[
              styles.commentInput,
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
                opacity: submitting ? 0.5 : 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.lg,
  },
  backLink: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: Spacing.md,
  },
  headerSpacer: {
    width: 32,
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
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    color: "#FFF",
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  postTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
    lineHeight: 30,
  },
  postContent: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  postImage: {
    width: "100%",
    height: 220,
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
    fontSize: 24,
  },
  hugText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  commentsSection: {
    marginTop: Spacing.md,
  },
  commentsTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  noComments: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  noCommentsText: {
    fontSize: FontSize.md,
  },
  commentCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  commentAvatarText: {
    color: "#FFF",
    fontSize: FontSize.sm,
    fontWeight: "bold",
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: FontSize.xs,
  },
  commentContent: {
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  commentHugButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  commentHugEmoji: {
    fontSize: 14,
  },
  commentHugText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  commentInput: {
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
