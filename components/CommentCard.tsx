import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { Comment } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface CommentCardProps {
  comment: Comment;
  isHugged?: boolean;
  onHug?: () => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  isHugged = false,
  onHug,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const timeAgo = formatDistanceToNow(comment.createdAt, {
    addSuffix: true,
    locale: tr,
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {comment.authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: colors.text }]}>
            {comment.authorName}
          </Text>
          <Text style={[styles.timeAgo, { color: colors.textMuted }]}>
            {timeAgo}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]}>
        {comment.content}
      </Text>

      {/* Hug Button */}
      <TouchableOpacity
        onPress={onHug}
        style={[
          styles.hugButton,
          { backgroundColor: isHugged ? colors.hug + "20" : "transparent" },
        ]}
      >
        <Text style={styles.hugEmoji}>{isHugged ? "🤗" : "🫂"}</Text>
        <Text
          style={[
            styles.hugCount,
            { color: isHugged ? colors.hug : colors.textMuted },
          ]}
        >
          {comment.hugsCount}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: "#FFF",
    fontSize: FontSize.sm,
    fontWeight: "bold",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: FontSize.xs,
  },
  content: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  hugButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    gap: 4,
  },
  hugEmoji: {
    fontSize: 14,
  },
  hugCount: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
});
