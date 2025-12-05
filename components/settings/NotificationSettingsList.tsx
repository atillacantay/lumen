import { BorderRadius, Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { NotificationItem, NotificationPreferences } from "@/types";
import { StyleSheet, View } from "react-native";
import { NotificationSettingItem } from "./NotificationSettingItem";

interface NotificationSettingsListProps {
  items: NotificationItem[];
  preferences: NotificationPreferences;
  updatingKey: string | null;
  onToggle: (key: keyof NotificationPreferences) => void;
}

export function NotificationSettingsList({
  items,
  preferences,
  updatingKey,
  onToggle,
}: NotificationSettingsListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      {items.map((item, index) => (
        <NotificationSettingItem
          key={item.id}
          item={item}
          isEnabled={preferences[item.id]}
          isUpdating={updatingKey === item.id}
          onToggle={() => onToggle(item.id)}
          showBorder={index < items.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
});
