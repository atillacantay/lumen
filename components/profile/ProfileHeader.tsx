import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileHeaderProps {
  postsCount: number;
  commentsCount: number;
}

export function ProfileHeader({
  postsCount,
  commentsCount,
}: ProfileHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/settings" as any)}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>
          {user?.anonymousName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Username */}
      <Text style={[styles.username, { color: colors.text }]}>
        {user?.anonymousName}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Anonim Kullanıcı
      </Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {postsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Paylaşım
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {commentsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Yorum
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: 60,
    right: Spacing.md,
    padding: Spacing.xs,
    zIndex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.xxl,
    fontWeight: "bold",
  },
  username: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
