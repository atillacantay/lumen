import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useCategories } from "@/context/CategoryContext";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trackPostCreated } from "@/services/analytics-service";
import { uploadImage } from "@/services/image-service";
import { createPost } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreatePostScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();
  const { categories } = useCategories();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form validation
  const canSubmit = title.trim() && content.trim() && categoryId && user;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "İzin Gerekli",
        "Galeri erişimi için izin vermeniz gerekiyor."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const uploadedImageUrl = imageUri
        ? await uploadImage(imageUri)
        : undefined;

      const createdPost = await createPost({
        title: title.trim(),
        content: content.trim(),
        categoryId,
        authorId: user.id,
        authorName: user.anonymousName,
        imageUrl: uploadedImageUrl ?? undefined,
      });

      // Track the post creation event
      trackPostCreated({
        postId: createdPost.id,
        category: categoryId,
        hasImage: !!uploadedImageUrl,
        contentLength: content.trim().length,
      });

      Alert.alert("Başarılı", "Derdini paylaştın! 🤗", [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Hata", "Bir şeyler yanlış gitti. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Derdini Paylaş
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !canSubmit}
            style={[
              styles.submitButton,
              { backgroundColor: canSubmit ? colors.primary : colors.border },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Paylaş</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <Text style={[styles.label, { color: colors.text }]}>Başlık</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text },
            ]}
            placeholder="Ne sıkıntı var?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Content */}
          <Text style={[styles.label, { color: colors.text }]}>
            Anlat bakalım...
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.surface, color: colors.text },
            ]}
            placeholder="İçini dök, rahatla..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Categories */}
          <Text style={[styles.label, { color: colors.text }]}>
            Kategori Seç
          </Text>
          <View style={styles.categories}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      categoryId === cat.id ? cat.color : colors.surface,
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    { color: categoryId === cat.id ? "#FFF" : colors.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image */}
          <Text style={[styles.label, { color: colors.text }]}>
            Resim Ekle (Opsiyonel)
          </Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                style={[
                  styles.removeImageButton,
                  { backgroundColor: colors.error },
                ]}
              >
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.imagePicker, { backgroundColor: colors.surface }]}
              onPress={pickImage}
            >
              <Ionicons
                name="image-outline"
                size={32}
                color={colors.textMuted}
              />
              <Text
                style={[styles.imagePickerText, { color: colors.textMuted }]}
              >
                Resim seç
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  submitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 70,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  form: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    minHeight: 120,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  imagePicker: {
    height: 100,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  imagePickerText: {
    fontSize: FontSize.sm,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.lg,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
