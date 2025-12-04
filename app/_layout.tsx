import { CategoryProvider } from "@/context/CategoryContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { UserProvider } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NativeModules } from "react-native";
import "react-native-reanimated";

// Enable remote debugging in development
if (__DEV__) {
  NativeModules.DevSettings?.setIsDebuggingRemotely?.(true);
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
      <NotificationProvider>
        <CategoryProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="create-post"
                options={{
                  presentation: "modal",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="post/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </CategoryProvider>
      </NotificationProvider>
    </UserProvider>
  );
}
