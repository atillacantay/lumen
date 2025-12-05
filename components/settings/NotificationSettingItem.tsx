import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { NotificationItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";

interface NotificationSettingItemProps {
  item: NotificationItem;
  isEnabled: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  showBorder: boolean;
}

export function NotificationSettingItem({
  item,
  isEnabled,
  isUpdating,
  onToggle,
  showBorder,
}: NotificationSettingItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.item,
        showBorder && {
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}
      >
        <Ionicons name={item.icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={isEnabled ? colors.primary : colors.textMuted}
        disabled={isUpdating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
