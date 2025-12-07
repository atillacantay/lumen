import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CommentInputProps {
  onPress?: () => void;
  bottomInset?: number;
}

export function CommentInput({ onPress, bottomInset = 0 }: CommentInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingBottom:
            Platform.OS === "android" ? bottomInset + Spacing.md : bottomInset,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.input, { backgroundColor: colors.background }]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text style={[styles.placeholder, { color: colors.textMuted }]}>
          Destek ol, yorum yaz...
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  input: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: "center",
  },
  placeholder: {
    fontSize: FontSize.md,
  },
});
