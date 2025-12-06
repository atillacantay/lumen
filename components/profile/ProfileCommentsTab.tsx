import { CommentCard } from "@/components/CommentCard";
import { ListFooter } from "@/components/ListFooter";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { UseInfiniteListResult } from "@/hooks/use-infinite-list";
import { toggleCommentHug } from "@/services/comment-service";
import { Comment, User } from "@/types";
import { useRouter } from "expo-router";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ProfileEmptyState } from "./ProfileEmptyState";

interface ProfileCommentsTabProps {
  user: User;
  commentsData: UseInfiniteListResult<Comment>;
}

export function ProfileCommentsTab({
  user,
  commentsData,
}: ProfileCommentsTabProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const {
    items: comments,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    updateItem,
  } = commentsData;

  const handleHugComment = async (commentId: string) => {
    if (!user) return;
    try {
      const nowHugged = await toggleCommentHug(
        commentId,
        user.id,
        user.anonymousName
      );
      updateItem(commentId, (comment) => ({
        ...comment,
        isHugged: nowHugged,
        hugsCount: comment.hugsCount + (nowHugged ? 1 : -1),
      }));
    } catch {
      // Silently fail
    }
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/post/${item.postId}` as any)}
          activeOpacity={0.8}
        >
          <CommentCard
            comment={item}
            isHugged={item.isHugged}
            onHug={() => handleHugComment(item.id)}
          />
        </TouchableOpacity>
      )}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
      ListEmptyComponent={
        <ProfileEmptyState emoji="💬" text="Henüz yorum yapmadın" />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
});
