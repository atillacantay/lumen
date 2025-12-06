import { Colors } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";

import CategoryHeader from "@/components/explore/CategoryHeader";
import CategoryList from "@/components/explore/CategoryList";

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { categories } = useCategories();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CategoryHeader
        title="Keşfet"
        subtitle="Bir kategori seç"
        colors={colors}
      />
      <CategoryList categories={categories} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
