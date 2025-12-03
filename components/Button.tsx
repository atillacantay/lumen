import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    // Size
    switch (size) {
      case "small":
        base.paddingHorizontal = Spacing.md;
        base.paddingVertical = Spacing.sm;
        break;
      case "large":
        base.paddingHorizontal = Spacing.xl;
        base.paddingVertical = Spacing.md;
        break;
      default:
        base.paddingHorizontal = Spacing.lg;
        base.paddingVertical = Spacing.md;
    }

    // Variant
    switch (variant) {
      case "secondary":
        base.backgroundColor = colors.secondary;
        break;
      case "outline":
        base.backgroundColor = "transparent";
        base.borderWidth = 2;
        base.borderColor = colors.primary;
        break;
      default:
        base.backgroundColor = colors.primary;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: "600",
    };

    // Size
    switch (size) {
      case "small":
        base.fontSize = FontSize.sm;
        break;
      case "large":
        base.fontSize = FontSize.lg;
        break;
      default:
        base.fontSize = FontSize.md;
    }

    // Variant
    switch (variant) {
      case "outline":
        base.color = colors.primary;
        break;
      default:
        base.color = "#FFFFFF";
    }

    return base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
});
