import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Theme } from '@/constants/Theme';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Amiri font for Arabic text - you'll need to download this font
    Amiri: require('../assets/fonts/SpaceMono-Regular.ttf'), // Temporarily using SpaceMono until Amiri is added
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Create custom theme based on our Islamic theme
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Theme.colors.primary,
      background: Theme.colors.background,
      card: Theme.colors.surface,
      text: Theme.colors.text,
      border: Theme.colors.textLight,
      notification: Theme.colors.accent,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Theme.colors.primaryLight,
      background: Theme.colors.backgroundDark,
      card: Theme.colors.surfaceDark,
      text: Theme.colors.textDark,
      border: Theme.colors.textLightDark,
      notification: Theme.colors.accentLight,
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="donasi" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}