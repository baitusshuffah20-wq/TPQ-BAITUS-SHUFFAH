import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "react-query";
import FlashMessage from "react-native-flash-message";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
          "Inter-Medium": require("./assets/fonts/Inter-Medium.ttf"),
          "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
          "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
        });

        // Artificially delay for demo purposes
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <NavigationContainer>
                <AppNavigator />
                <StatusBar style="auto" />
                <FlashMessage position="top" />
              </NavigationContainer>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
