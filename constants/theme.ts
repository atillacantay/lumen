/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    primary: "#6C5CE7",
    primaryLight: "#A29BFE",
    secondary: "#00B894",
    text: "#2D3436",
    textSecondary: "#636E72",
    textMuted: "#B2BEC3",
    border: "#E9ECEF",
    error: "#FF6B6B",
    success: "#00B894",
    warning: "#FDCB6E",
    hug: "#FF7675",
    cardShadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    background: "#1A1A2E",
    surface: "#16213E",
    primary: "#A29BFE",
    primaryLight: "#6C5CE7",
    secondary: "#55EFC4",
    text: "#FFFFFF",
    textSecondary: "#B2BEC3",
    textMuted: "#636E72",
    border: "#2D3436",
    error: "#FF6B6B",
    success: "#55EFC4",
    warning: "#FDCB6E",
    hug: "#FF7675",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
