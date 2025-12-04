import { ListFooter } from "@/components/ListFooter";
import { PostCard } from "@/components/PostCard";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { UseInfiniteListResult } from "@/hooks/use-infinite-list";
import { toggleHug } from "@/services/post-service";
import { Post, User } from "@/types";
import { useRouter } from "expo-router";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { ProfileEmptyState } from "./ProfileEmptyState";

interface ProfilePostsTabProps {
  user: User;
  postsData: UseInfiniteListResult<Post>;
}

export function ProfilePostsTab({ user, postsData }: ProfilePostsTabProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const {
    items: posts,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    updateItem,
  } = postsData;

  const handleHugPost = async (postId: string) => {
    if (!user) return;
    try {
      const nowHugged = await toggleHug(postId, user.id, user.anonymousName);
      updateItem(postId, (post) => ({
        ...post,
        isHugged: nowHugged,
        hugsCount: post.hugsCount + (nowHugged ? 1 : -1),
      }));
    } catch (error) {
      console.error("Hug error:", error);
    }
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  return (
    <FlatList
      data={posts}
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
        <PostCard
          post={item}
          onPress={() => router.push(`/post/${item.id}` as any)}
          onHug={() => handleHugPost(item.id)}
        />
      )}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
      ListEmptyComponent={
        <ProfileEmptyState emoji="📝" text="Henüz paylaşım yapmadın" />
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
