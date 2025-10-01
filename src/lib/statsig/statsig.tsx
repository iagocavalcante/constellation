import React from "react";
import { Platform } from "react-native";
import { AppState, AppStateStatus } from "react-native";
import { sha256 } from "js-sha256";
import {
  StatsigClientExpo,
  StatsigProviderExpo,
  useStatsigClient,
} from "@statsig/expo-bindings";

import { logger } from "@/logger";
// import * as persisted from "@/state/persisted";
import { BUNDLE_DATE, BUNDLE_IDENTIFIER, IS_TESTFLIGHT } from "@/lib/app-info";
import { useSession } from "@/state/session";
import { timeout } from "@/lib/async/timeout";
import { useNonReactiveCallback } from "../hooks/useNonReactiveCallback";
import { LogEvents } from "./events";
import { Gate } from "./gates";
import { STATSIG_KEY } from "@/env";

export const SDK_KEY = STATSIG_KEY;

type StatsigUser = {
  userID: string | undefined;
  // TODO: Remove when enough users have custom.platform:
  platform: "ios" | "android" | "web";
  custom: {
    // This is the place where we can add our own stuff.
    // Fields here have to be non-optional to be visible in the UI.
    platform: "ios" | "android" | "web";
    bundleIdentifier: string;
    bundleDate: number;
    refSrc: string;
    refUrl: string;
    appLanguage: string;
    contentLanguages: string[];
  };
};

let refSrc = "";
let refUrl = "";

export type { LogEvents };

function createStatsigOptions(prefetchUsers: StatsigUser[]) {
  return {
    // environment: {
    //   tier:
    //     process.env.NODE_ENV === "development"
    //       ? "development"
    //       : IS_TESTFLIGHT
    //         ? "staging"
    //         : "production",
    // },
    // // Don't block on waiting for network. The fetched config will kick in on next load.
    // // This ensures the UI is always consistent and doesn't update mid-session.
    // // Note this makes cold load (no local storage) and private mode return `false` for all gates.
    // initTimeoutMs: 1,
    // Get fresh flags for other accounts as well, if any.
    // prefetchUsers,
  };
}

type FlatJSONRecord = Record<
  string,
  | string
  | number
  | boolean
  | null
  | undefined
  // Technically not scalar but Statsig will stringify it which works for us:
  | string[]
>;

let getCurrentRouteName: () => string | null | undefined = () => null;

export function attachRouteToLogEvents(
  getRouteName: () => string | null | undefined,
) {
  getCurrentRouteName = getRouteName;
}

export function toClout(n: number | null | undefined): number | undefined {
  if (n == null) {
    return undefined;
  } else {
    return Math.max(0, Math.round(Math.log(n)));
  }
}

const DOWNSAMPLED_EVENTS: Set<keyof LogEvents> = new Set([
  "router:navigate:sampled",
  "state:background:sampled",
  "state:foreground:sampled",
  "home:feedDisplayed:sampled",
  "feed:endReached:sampled",
  "feed:refresh:sampled",
  "discover:clickthrough:sampled",
  "discover:engaged:sampled",
  "discover:seen:sampled",
]);
const isDownsampledSession = Math.random() < 0.9; // 90% likely

export function logEvent<E extends keyof LogEvents>(
  eventName: E & string,
  rawMetadata: LogEvents[E] & FlatJSONRecord,
  client?: StatsigClientExpo | null,
) {
  if (!client) return;

  try {
    if (
      process.env.NODE_ENV === "development" &&
      eventName.endsWith(":sampled") &&
      !DOWNSAMPLED_EVENTS.has(eventName)
    ) {
      logger.error(
        "Did you forget to add " + eventName + " to DOWNSAMPLED_EVENTS?",
      );
    }

    if (isDownsampledSession && DOWNSAMPLED_EVENTS.has(eventName)) {
      return;
    }

    const fullMetadata = {
      ...rawMetadata,
      routeName: getCurrentRouteName() ?? "(Uninitialized)",
    } as Record<string, string>;

    client.logEvent(eventName, undefined, fullMetadata);
  } catch (e) {
    logger.error("Failed to log an event", { message: e });
  }
}

// We roll our own cache in front of Statsig because it is a singleton
// and it's been difficult to get it to behave in a predictable way.
// Our own cache ensures consistent evaluation within a single session.
const GateCache = React.createContext<Map<string, boolean> | null>(null);

type GateOptions = {
  dangerouslyDisableExposureLogging?: boolean;
};

export function useGate(): (
  gateName: Gate,
  client: StatsigClientExpo,
  options?: GateOptions,
) => boolean {
  const cache = React.useContext(GateCache);
  if (!cache) {
    throw Error("useGate() cannot be called outside StatsigProvider.");
  }
  const gate = React.useCallback(
    (
      gateName: Gate,
      client: StatsigClientExpo,
      options: GateOptions = {},
    ): boolean => {
      const cachedValue = cache.get(gateName);
      if (cachedValue !== undefined) {
        return cachedValue;
      }
      let value = false;
      value = client.checkGate(gateName);
      cache.set(gateName, value);
      return value;
    },
    [cache],
  );
  return gate;
}

function toStatsigUser(did: string | undefined): StatsigUser {
  let userID: string | undefined;
  if (did) {
    userID = sha256(did);
  }
  // const languagePrefs = persisted.get("languagePrefs");
  return {
    userID,
    platform: Platform.OS as "ios" | "android" | "web",
    custom: {
      refSrc,
      refUrl,
      platform: Platform.OS as "ios" | "android" | "web",
      bundleIdentifier: BUNDLE_IDENTIFIER,
      bundleDate: BUNDLE_DATE,
      appLanguage: "en",
      contentLanguages: ["en"],
    },
  };
}

let lastState: AppStateStatus = AppState.currentState;
let lastActive = lastState === "active" ? performance.now() : null;
AppState.addEventListener("change", (state: AppStateStatus) => {
  if (state === lastState) {
    return;
  }
  lastState = state;
  if (state === "active") {
    lastActive = performance.now();
    logEvent("state:foreground:sampled", {});
  } else {
    let secondsActive = 0;
    if (lastActive != null) {
      secondsActive = Math.round((performance.now() - lastActive) / 1e3);
    }
    lastActive = null;
    logEvent("state:background:sampled", {
      secondsActive,
    });
  }
});

export async function tryFetchGates(
  did: string | undefined,
  strategy: "prefer-low-latency" | "prefer-fresh-gates",
) {
  try {
    if (!statsigClientInstance) {
      return; // Not initialized yet, skip
    }
    
    let timeoutMs = 250; // Don't block the UI if we can't do this fast.
    if (strategy === "prefer-fresh-gates") {
      // Use this for less common operations where the user would be OK with a delay.
      timeoutMs = 1500;
    }

    await Promise.race([
      timeout(timeoutMs),
      statsigClientInstance.dataAdapter.prefetchData(toStatsigUser(did)),
    ]);
  } catch (e) {
    // Don't leak errors to the calling code, this is meant to be always safe.
    console.error(e);
  }
}

let statsigClientInstance: StatsigClientExpo | null = null;

export async function initialize() {
  if (statsigClientInstance) {
    return statsigClientInstance;
  }

  // Temporarily disabled due to AsyncStorage format errors
  // statsigClientInstance = new StatsigClientExpo(SDK_KEY as string, {});
  // await statsigClientInstance.initializeAsync();
  return statsigClientInstance;
}

export function Provider({ children }: { children: React.ReactNode }) {
  const { currentAccount, accounts } = useSession();
  const did = currentAccount?.did;
  const [isReady, setIsReady] = React.useState(false);
  const [client, setClient] = React.useState<StatsigClientExpo | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const statsigClient = await initialize();
        if (mounted && statsigClient) {
          setClient(statsigClient);
          setIsReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize Statsig:", err);
        if (mounted) {
          setError(err as Error);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const currentStatsigUser = React.useMemo(() => toStatsigUser(did), [did]);

  const otherDidsConcatenated = accounts
    .map((account) => account.did)
    .filter((accountDid) => accountDid !== did)
    .join(" "); // We're only interested in DID changes.
  const otherStatsigUsers = React.useMemo(
    () => otherDidsConcatenated.split(" ").map(toStatsigUser),
    [otherDidsConcatenated],
  );
  const statsigOptions = React.useMemo(
    () => createStatsigOptions(otherStatsigUsers),
    [otherStatsigUsers],
  );

  // Have our own cache in front of StatsigClientExpo.
  // This ensures the results remain stable until the active DID changes.
  const [gateCache, setGateCache] = React.useState(() => new Map());
  const [prevDid, setPrevDid] = React.useState(did);
  if (did !== prevDid) {
    setPrevDid(did);
    setGateCache(new Map());
  }

  // Periodically poll Statsig to get the current rule evaluations for all stored accounts.
  // These changes are prefetched and stored, but don't get applied until the active DID changes.
  // This ensures that when you switch an account, it already has fresh results by then.
  const handleIntervalTick = useNonReactiveCallback(() => {
    if (client) {
      client.dataAdapter.prefetchData({
        ...currentStatsigUser,
        ...otherStatsigUsers,
      });
    }
  });

  React.useEffect(() => {
    if (isReady) {
      const id = setInterval(handleIntervalTick, 60e3);
      return () => clearInterval(id);
    }
  }, [handleIntervalTick, isReady]);

  if (error) {
    // You might want to handle this differently
    console.error("Statsig initialization failed:", error);
    return children; // Continue without Statsig
  }

  // Temporarily disabled due to AsyncStorage format errors
  return <GateCache.Provider value={gateCache}>{children}</GateCache.Provider>;

  // if (!isReady || !client) {
  //   return <>{children}</>; // Render children without Statsig if not ready
  // }

  // return (
  //   <GateCache.Provider value={gateCache}>
  //     <StatsigProviderExpo
  //       key={did}
  //       sdkKey={SDK_KEY as string}
  //       user={currentStatsigUser}
  //       options={{
  //         environment: {
  //           tier:
  //             process.env.NODE_ENV === "development"
  //               ? "development"
  //               : IS_TESTFLIGHT
  //                 ? "staging"
  //                 : "production",
  //         },
  //       }}
  //     >
  //       {children}
  //     </StatsigProviderExpo>
  //   </GateCache.Provider>
  // );
}
