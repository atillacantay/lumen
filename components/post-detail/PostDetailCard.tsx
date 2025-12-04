import { ImageZoom } from "@/components/ImageZoom";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Category, Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PostDetailCardProps {
  post: Post;
  category?: Category | null;
  onHug: () => void;
}

export function PostDetailCard({ post, category, onHug }: PostDetailCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch {
      return "";
    }
  };

  return (
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

      {/* Image */}
      {post.imageUrl && (
        <ImageZoom imageUrl={post.imageUrl} imageStyle={styles.postImage} />
      )}

      {/* Hug Button */}
      <TouchableOpacity
        onPress={onHug}
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
  );
}

const styles = StyleSheet.create({
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
});
