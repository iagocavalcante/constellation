import { AtpAgent } from "@atproto/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const agent = new AtpAgent({
  service: "https://bsky.social",
});

interface TokenData {
  did: string;
  accessJwt: string;
  refreshJwt: string;
  accessDate: string;
  refreshDate: string;
}

const STORAGE_KEY = "@bsky_token";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getStoredToken(): Promise<TokenData | null> {
  try {
    const tokenJson = await AsyncStorage.getItem(STORAGE_KEY);
    return tokenJson ? JSON.parse(tokenJson) : null;
  } catch (error) {
    console.error("Error reading token:", error);
    return null;
  }
}

async function storeToken(tokenData: TokenData) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData));
  } catch (error) {
    console.error("Error storing token:", error);
  }
}

async function refreshSession(refreshJwt: string) {
  try {
    const response = await fetch(
      "https://bsky.social/xrpc/com.atproto.server.refreshSession",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${refreshJwt}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error refreshing session:", error);
    throw error;
  }
}

export async function getValidToken(forceRefresh = false) {
  const now = moment();
  let tokenData = await getStoredToken();

  if (!tokenData) {
    return null;
  }

  // Check if refresh token is too old (50 days)
  if (now.diff(tokenData.refreshDate, "days") > 50) {
    return null;
  }

  // Check if access token needs refresh (90 minutes)
  if (forceRefresh || now.diff(tokenData.accessDate, "minutes") > 90) {
    try {
      const refreshJson = await refreshSession(tokenData.refreshJwt);
      tokenData = {
        ...tokenData,
        accessJwt: refreshJson.accessJwt,
        refreshJwt: refreshJson.refreshJwt,
        accessDate: now.format(),
      };
      await storeToken(tokenData);
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  return tokenData;
}

const formatIdentifier = (identifier: string): string => {
  const cleaned = identifier.toLowerCase().trim();
  // If it's an email, return as is
  if (cleaned.includes("@")) {
    return cleaned;
  }
  // If it has dots, it might be a custom domain or full handle
  if (cleaned.includes(".")) {
    return cleaned;
  }
  // Only append .bsky.social for simple usernames
  return `${cleaned}.bsky.social`;
};

export const loginToBsky = async (identifier: string, password: string) => {
  try {
    await delay(1000);

    // Remove any formatting for email addresses
    const formattedIdentifier = identifier.includes("@")
      ? identifier.trim()
      : formatIdentifier(identifier);

    console.log("Attempting login with:", { formattedIdentifier }); // Debug log

    const response = await agent.com.atproto.server.createSession({
      identifier: formattedIdentifier,
      password,
    });

    const now = moment();
    const tokenData: TokenData = {
      did: response.did,
      accessJwt: response.accessJwt,
      refreshJwt: response.refreshJwt,
      accessDate: now.format(),
      refreshDate: now.format(),
    };

    await storeToken(tokenData);

    return {
      success: true,
      data: {
        did: response.did,
        handle: response.handle,
        email: identifier,
        accessJwt: response.accessJwt,
        refreshJwt: response.refreshJwt,
      },
    };
  } catch (error) {
    console.error("Login failed with full error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Rate Limit Exceeded")) {
        return {
          success: false,
          error: "Too many login attempts. Please wait a moment and try again.",
          isRateLimit: true,
        };
      }

      if (error.message.includes("Invalid identifier or password")) {
        return {
          success: false,
          error: "Invalid username or password. Please check your credentials.",
        };
      }
    }

    return {
      success: false,
      error: "Unable to connect. Please try again in a moment.",
    };
  }
};

export async function getAuthenticatedAgent() {
  const tokenData = await getValidToken();
  if (!tokenData) {
    return null;
  }

  agent.session = {
    did: tokenData.did,
    accessJwt: tokenData.accessJwt,
    refreshJwt: tokenData.refreshJwt,
  };

  return agent;
}
