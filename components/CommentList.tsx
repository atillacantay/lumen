import { Colors, FontSize, Spacing } from "@/constants/theme";
import { CommentSortOption } from "@/services/comment-service";
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

interface CommentListProps {
  postId: string;
  comments: Comment[];
  userId?: string;
  sortBy?: CommentSortOption;
  onHugComment: (commentId: string) => void;
  onCommentsChange: (comments: Comment[]) => void;
  onOpenSortSheet?: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  postId,
  comments,
  userId,
  sortBy = "oldest",
  onHugComment,
  onCommentsChange,
  onOpenSortSheet,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [isLoading] = useState(false);

  const handleOpenSortSheet = () => {
    onOpenSortSheet?.();
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          💬 Yorumlar ({comments.length})
        </Text>
        {comments.length > 1 && (
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: colors.primary + "15" },
            ]}
            onPress={handleOpenSortSheet}
            disabled={isLoading}
          >
            <Ionicons name="funnel" size={16} color={colors.primary} />
            <Text style={[styles.sortButtonText, { color: colors.primary }]}>
              Sırala
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
            isHugged={comment.isHugged}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    flex: 1,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    gap: 4,
  },
  sortButtonText: {
    fontSize: FontSize.sm,
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
