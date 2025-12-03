import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
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
  showCategory?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onHug,
  showCategory = true,
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
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      {/* Header - Category & Date */}
      {showCategory && (
        <View style={styles.header}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category?.color || colors.primary },
            ]}
          >
            <Text style={styles.categoryEmoji}>{category?.emoji || "💭"}</Text>
            <Text style={styles.categoryName}>{category?.name || "Diğer"}</Text>
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {timeAgo}
          </Text>
        </View>
      )}

      {/* Title & Content */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {post.title}
      </Text>
      <Text
        style={[styles.content, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {post.content}
      </Text>

      {/* Image */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {post.authorName}
          {!showCategory && ` • ${timeAgo}`}
        </Text>
        <View style={styles.stats}>
          <TouchableOpacity
            onPress={onHug}
            style={[
              styles.hugButton,
              {
                backgroundColor: post.isHugged
                  ? colors.hug + "20"
                  : "transparent",
              },
            ]}
          >
            <Text style={styles.hugEmoji}>{post.isHugged ? "🤗" : "🫂"}</Text>
          </TouchableOpacity>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            {post.hugsCount}
          </Text>
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            {post.commentsCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFF",
  },
  date: {
    fontSize: FontSize.xs,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  content: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    fontSize: FontSize.xs,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: FontSize.xs,
  },
  hugButton: {
    padding: 4,
    borderRadius: BorderRadius.sm,
  },
  hugEmoji: {
    fontSize: FontSize.sm,
  },
});
