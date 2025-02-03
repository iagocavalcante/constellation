import "@/lib/sentry";

import { Stack } from "expo-router";
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
import React, { useEffect, useState } from "react";
import {
  initialize,
  tryFetchGates,
  Provider as StatsigProvider,
} from "@/lib/statsig/statsig";
import { logger } from "@/logger";
import { readLastActiveAccount } from "@/state/session/util";
import { listenSessionDropped } from "@/state/events";
import * as Toast from "@/components/toast";

function InnerApp() {
  const [isReady, setIsReady] = React.useState(false);
  const { currentAccount } = useSession();
  const { resumeSession } = useSessionApi();

  // init
  useEffect(() => {
    async function onLaunch(account?: SessionAccount) {
      try {
        if (account) {
          await resumeSession(account);
        } else {
          await initialize();
          await tryFetchGates(undefined, "prefer-fresh-gates");
        }
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

  return (
    <StatsigProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
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

  if (!isReady) {
    return null;
  }

  return (
    <SessionProvider>
      <InnerApp></InnerApp>
    </SessionProvider>
  );
}
