import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import {
  CommentSortOption,
  getCommentsByPost,
} from "@/services/comment-service";
import { Comment } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { CommentCard } from "./CommentCard";

const SORT_OPTIONS: { key: CommentSortOption; label: string; icon: string }[] =
  [
    { key: "oldest", label: "Eskiden Yeniye", icon: "time-outline" },
    { key: "newest", label: "Yeniden Eskiye", icon: "time" },
    { key: "popular", label: "Popüler", icon: "heart" },
  ];

interface CommentListProps {
  postId: string;
  comments: Comment[];
  huggedComments: Set<string>;
  onHugComment: (commentId: string) => void;
  onCommentsChange: (comments: Comment[]) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  postId,
  comments,
  huggedComments,
  onHugComment,
  onCommentsChange,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [sortBy, setSortBy] = useState<CommentSortOption>("oldest");
  const [isLoading, setIsLoading] = useState(false);

  const handleSortChange = async (newSort: CommentSortOption) => {
    if (newSort === sortBy) return;

    setSortBy(newSort);
    setIsLoading(true);

    try {
      const sortedComments = await getCommentsByPost(postId, newSort);
      onCommentsChange(sortedComments);
    } catch (error) {
      console.error("Yorumlar yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          💬 Yorumlar ({comments.length})
        </Text>
      </View>

      {/* Sort Options */}
      {comments.length > 1 && (
        <View style={styles.sortContainer}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && {
                  backgroundColor: colors.primary + "20",
                },
              ]}
              onPress={() => handleSortChange(option.key)}
              disabled={isLoading}
            >
              <Ionicons
                name={option.icon as any}
                size={14}
                color={
                  sortBy === option.key ? colors.primary : colors.textMuted
                }
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
      )}

      {/* Loading */}
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loader}
        />
      )}

      {/* Comments */}
      {!isLoading && comments.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Henüz yorum yok. İlk yorumu sen yap!
        </Text>
      ) : (
        !isLoading &&
        comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isHugged={huggedComments.has(comment.id)}
            onHug={() => onHugComment(comment.id)}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
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
  loader: {
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    fontSize: FontSize.md,
    paddingVertical: Spacing.lg,
  },
});
