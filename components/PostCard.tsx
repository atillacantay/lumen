import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onHug?: () => void;
  isHugged?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onHug,
  isHugged = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { getCategoryById } = useCategories();
  const category = getCategoryById(post.categoryId);

  const timeAgo = formatDistanceToNow(post.createdAt, {
    addSuffix: true,
    locale: tr,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
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
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {post.authorName}
            </Text>
            <Text style={[styles.timeAgo, { color: colors.textMuted }]}>
              {timeAgo}
            </Text>
          </View>
        </View>
        {category && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category.color + "20" },
            ]}
          >
            <Text style={styles.categoryIcon}>{category.emoji}</Text>
            <Text style={[styles.categoryName, { color: category.color }]}>
              {category.name}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {post.title}
      </Text>
      <Text
        style={[styles.content, { color: colors.textSecondary }]}
        numberOfLines={3}
      >
        {post.content}
      </Text>

      {/* Image */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}

      {/* Footer */}
      <View style={styles.footer}>
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
            {post.hugsCount} sarıldı
          </Text>
        </TouchableOpacity>

        <View style={styles.commentInfo}>
          <Text style={styles.commentEmoji}>💬</Text>
          <Text style={[styles.commentCount, { color: colors.textSecondary }]}>
            {post.commentsCount} yorum
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "bold",
  },
  authorName: {
    fontSize: FontSize.sm,
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
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryName: {
    fontSize: FontSize.xs,
    fontWeight: "500",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
  },
  content: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  hugButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  hugEmoji: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  hugCount: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  commentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  commentCount: {
    fontSize: FontSize.sm,
  },
});
