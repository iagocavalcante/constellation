import { Stack, useRouter, useSegments } from "expo-router";
import { init as initPersistedState } from "@/state/persisted";
import {
  Mulish_400Regular,
  Mulish_600SemiBold,
  Mulish_700Bold,
  useFonts,
} from "@expo-google-fonts/mulish";
import {
  Provider as SessionProvider,
  SessionAccount,
  useSession,
  useSessionApi,
} from "@/state/session";
import React, { useEffect, useState, useCallback } from "react";
import {
  initialize,
  tryFetchGates,
  Provider as StatsigProvider,
} from "@/lib/statsig/statsig";
import { logger } from "@/logger";
import { readLastActiveAccount } from "@/state/session/util";
import { listenSessionDropped } from "@/state/events";
import * as Toast from "@/components/toast";
import { Provider as ModalProvider } from "@/state/modals";
import { ModalRenderer } from "@/components/modals";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function InnerApp() {
  const [isReady, setIsReady] = React.useState(false);
  const { currentAccount } = useSession();
  const { resumeSession } = useSessionApi();
  const segments = useSegments();
  const router = useRouter();

  // init
  useEffect(() => {
    async function onLaunch(account?: SessionAccount) {
      try {
        if (account) {
          await resumeSession(account);
        }
        // Statsig initialization moved to StatsigProvider
      } catch (e) {
        logger.error(`session: resume failed`, { message: e });
      } finally {
        setIsReady(true);
      }
    }
    const account = readLastActiveAccount();
    onLaunch(account);
  }, [resumeSession]);

  useEffect(() => {
    return listenSessionDropped(() => {
      Toast.show(`Sorry! Your session expired. Please log in again.`, "info");
    });
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (!currentAccount && !inAuthGroup) {
      // User is not logged in and trying to access main app, redirect to login
      router.replace("/(auth)/login");
    } else if (currentAccount && inAuthGroup) {
      // User is logged in and on auth screen, redirect to main app
      router.replace("/(main)");
    }
  }, [currentAccount, segments, isReady, router]);

  return (
    <StatsigProvider>
      <ModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        </Stack>
        <ModalRenderer />
      </ModalProvider>
    </StatsigProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Mulish_400Regular,
    Mulish_700Bold,
    Mulish_600SemiBold,
  });

  const [isReady, setReady] = useState(false);

  React.useEffect(() => {
    initPersistedState().then(() => setReady(true));
  }, []);

  const onLayoutReady = useCallback(async () => {
    if (isReady && (loaded || error)) {
      await SplashScreen.hideAsync();
    }
  }, [isReady, loaded, error]);

  React.useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  if (!isReady || (!loaded && !error)) {
    return null;
  }

  return (
    <SessionProvider>
      <InnerApp></InnerApp>
    </SessionProvider>
  );
}
