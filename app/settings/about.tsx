import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Hakkında
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: colors.surface }]}>
          <View
            style={[styles.appIcon, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={styles.appIconText}>🌙</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Lumen</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Versiyon 1.0.0
          </Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Dertleş, Rahatla
          </Text>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Uygulama Hakkında
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Lumen, anonim olarak duygularını ve düşüncelerini paylaşabileceğin
            güvenli bir alan. Burada kimliğin gizli kalır, sadece sözlerin
            konuşur.
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Özellikler
          </Text>
          <View style={styles.featureList}>
            <FeatureItem
              icon="shield-checkmark-outline"
              text="Tam anonimlik"
              colors={colors}
            />
            <FeatureItem
              icon="heart-outline"
              text="Destekleyici topluluk"
              colors={colors}
            />
            <FeatureItem
              icon="chatbubbles-outline"
              text="Yorum ve etkileşim"
              colors={colors}
            />
            <FeatureItem
              icon="notifications-outline"
              text="Anlık bildirimler"
              colors={colors}
            />
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Made with 💜 in Turkey
        </Text>
      </ScrollView>
    </View>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  colors: any;
}

function FeatureItem({ icon, text, colors }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  appInfo: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  appIconText: {
    fontSize: 40,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
  },
  appVersion: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  appTagline: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
  section: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.sm,
  },
  footer: {
    textAlign: "center",
    fontSize: FontSize.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
