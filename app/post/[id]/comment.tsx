import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createComment } from "@/services/comment-service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CommentScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useUser();

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = isSubmitting || !content.trim();

  const handleSubmit = async () => {
    if (!content.trim() || !user || !postId) return;

    setIsSubmitting(true);
    try {
      await createComment({
        postId,
        content: content.trim(),
        authorId: user.id,
        authorName: user.anonymousName,
      });

      Alert.alert("Başarılı", "Yorumun paylaşıldı! 🎉", [
        {
          text: "Tamam",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to send comment:", error);
      Alert.alert("Hata", "Yorum gönderilemedi. Tekrar dene.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (content.trim()) {
      Alert.alert("Emin misin?", "Yazdığın yorum silinecek.", [
        { text: "Devam et", onPress: () => router.back() },
        { text: "İptal", style: "cancel" },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleClose}
            disabled={isSubmitting}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>Yorum Yaz</Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isDisabled}
            style={[
              styles.shareButton,
              {
                backgroundColor: isDisabled ? colors.border : colors.primary,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.shareText}>Paylaş</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Destek ol, yorum yaz..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
            editable={!isSubmitting}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {content.length}/500
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  shareButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 70,
    alignItems: "center",
  },
  shareText: {
    color: "#FFF",
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  input: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSize.md,
    borderWidth: 1,
    minHeight: 200,
  },
  charCount: {
    fontSize: FontSize.sm,
    textAlign: "right",
    paddingHorizontal: Spacing.sm,
  },
});
