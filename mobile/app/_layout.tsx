import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { StorageLogin } from "../constants/Storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserContext from "../constants/Context";
import { View } from "react-native";
import { I18nextProvider } from "react-i18next";
import i18n from "../locales/ii8n";
import { useTranslation } from "react-i18next";
import React from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </I18nextProvider>
  );
}

function RootLayoutNav() {
  const { theme } = useTheme();
  const [user, setUser] = useState<StorageLogin | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (user === null) {
      router.replace("/connexion");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </UserContext.Provider>
  );
}
