import { trackCategoryFiltered } from "@/services/analytics-service";
import { Category } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  categories: Category[];
  onSelect: (categoryId: string) => void;
  colors: any;
}

export default function CategoryList({ categories, onSelect, colors }: Props) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: colors.surface }]}
          onPress={() => {
            onSelect(item.id);
            trackCategoryFiltered({
              categoryId: item.id,
              categoryName: item.name,
            });
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.icon, { backgroundColor: item.color + "20" }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>

          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 22,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});
