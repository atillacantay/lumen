import { ListFooter } from "@/components/ListFooter";
import { PostCard } from "@/components/PostCard";
import { PostSkeleton } from "@/components/skeletons";
import { trackPullToRefresh } from "@/services/analytics-service";
import { Post } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

interface Props {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onHug: (postId: string) => void;
  colors: any;
}

export default function PostList({
  posts,
  isLoading,
  isLoadingMore,
  isRefreshing,
  onRefresh,
  onEndReached,
  onHug,
  colors,
}: Props) {
  const router = useRouter();

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        showCategory={false}
        onPress={() => router.push(`/post/${item.id}`)}
        onHug={() => onHug(item.id)}
      />
    ),
    [onHug, router]
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            trackPullToRefresh("explore");
            onRefresh();
          }}
          tintColor={colors.primary}
        />
      }
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
      ListEmptyComponent={() =>
        isLoading ? (
          <PostSkeleton count={3} />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Bu kategoride henüz paylaşım yok
            </Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
