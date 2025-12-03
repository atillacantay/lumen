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
  onHug?: () => void;
  isHugged?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onHug,
  isHugged = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const timeAgo = formatDistanceToNow(comment.createdAt, {
    addSuffix: true,
    locale: tr,
  });

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {comment.authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {comment.authorName}
            </Text>
            <Text style={[styles.timeAgo, { color: colors.textMuted }]}>
              {timeAgo}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.content, { color: colors.text }]}>
        {comment.content}
      </Text>

      <TouchableOpacity
        onPress={onHug}
        style={[
          styles.hugButton,
          {
            backgroundColor: isHugged ? colors.hug + "20" : "transparent",
          },
        ]}
      >
        <Text style={styles.hugEmoji}>{isHugged ? "🤗" : "🫂"}</Text>
        <Text
          style={[
            styles.hugCount,
            { color: isHugged ? colors.hug : colors.textSecondary },
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
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#FFFFFF",
    fontSize: FontSize.sm,
    fontWeight: "bold",
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
  },
  hugEmoji: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  hugCount: {
    fontSize: FontSize.xs,
    fontWeight: "500",
  },
});
