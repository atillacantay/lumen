import { Colors, Spacing } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

interface ListFooterProps {
  isLoadingMore: boolean;
}

export const ListFooter: React.FC<ListFooterProps> = ({ isLoadingMore }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  if (!isLoadingMore) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});
