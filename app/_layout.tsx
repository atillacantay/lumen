import { APP_CONFIG } from "@/config";
import { CategoryProvider } from "@/context/CategoryContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { UserProvider } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAppOpenAdUnitId, showAppOpenAd } from "@/services/admob-service";
import {
  trackAppOpened,
  trackSessionStart,
} from "@/services/analytics-service";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { NativeModules } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { vexo } from "vexo-analytics";

// Enable remote debugging in development
if (__DEV__) {
  NativeModules.DevSettings?.setIsDebuggingRemotely?.(true);
}

if (APP_CONFIG.vexoEnable) {
  vexo(APP_CONFIG.vexoApiKey || "");
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    trackSessionStart();
    trackAppOpened();
    showAppOpenAd(getAppOpenAdUnitId());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                  name="category/[id]"
                  options={{
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
                  name="post/[id]/comment"
                  options={{
                    presentation: "modal",
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
    </GestureHandlerRootView>
  );
}
