import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  isSubmitting: boolean;
  bottomInset?: number;
  editable?: boolean;
}

export function CommentInput({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  isSubmitting,
  bottomInset = 0,
  editable = true,
}: CommentInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isDisabled = isSubmitting || !value.trim() || !editable;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {!editable ? (
        <TouchableOpacity
          style={[styles.input, { backgroundColor: colors.background }]}
          onPress={onFocus}
          activeOpacity={0.6}
        >
          <TextInput
            style={[styles.inputText, { color: colors.textMuted }]}
            placeholder="Destek ol, yorum yaz..."
            placeholderTextColor={colors.textMuted}
            editable={false}
            pointerEvents="none"
            value=""
          />
        </TouchableOpacity>
      ) : (
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
          ]}
          placeholder="Destek ol, yorum yaz..."
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          multiline
          maxLength={500}
          editable={editable}
        />
      )}
      {editable && (
        <TouchableOpacity
          onPress={onSubmit}
          disabled={isDisabled}
          style={[
            styles.sendButton,
            {
              backgroundColor: value.trim() ? colors.primary : colors.border,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    maxHeight: 100,
  },
  inputText: {
    fontSize: FontSize.md,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
