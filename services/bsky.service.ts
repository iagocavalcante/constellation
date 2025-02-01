import {
  AtpAgent,
  AtpSessionData,
  AtpSessionEvent,
  BskyAgent,
} from "@atproto/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import ImageResizer from "react-native-image-resizer";

const STORAGE_KEY = "@bsky_token";

const agent = new AtpAgent({
  service: "https://bsky.social",
  persistSession: async (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    if (sess) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  },
});

export interface BskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    embed?: {
      $type: string;
      images?: {
        image: {
          ref: { $link: string };
          mimeType: string;
        };
        alt?: string;
      }[];
    };
  };
  embed: {
    $type: string;
    images: {
      thumb: string;
      fullsize: string;
      alt: string;
      aspectRatio: { height: number; width: number };
    }[];
  };
  likeCount: number;
  indexedAt: string;
}

interface TokenData {
  did: string;
  accessJwt: string;
  refreshJwt: string;
  accessDate: string;
  refreshDate: string;
  handle: string;
  active?: boolean;
}

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

  console.log(
    "[getValidToken] tokenData => ",
    JSON.stringify(tokenData, null, 2),
  );

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

    const { data } = await agent.login({
      identifier: formattedIdentifier,
      password,
    });

    console.log("response => ", JSON.stringify(data, null, 2));

    const now = moment();
    const tokenData: TokenData = {
      handle: data.handle,
      did: data.did,
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
      accessDate: now.format(),
      refreshDate: now.format(),
      active: data.active,
    };

    await storeToken(tokenData);

    return {
      success: true,
      data: {
        did: data.did,
        handle: data.handle,
        email: identifier,
        accessJwt: data.accessJwt,
        refreshJwt: data.refreshJwt,
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

  console.log("tokenData => ", JSON.stringify(tokenData, null, 2));

  return new AtpAgent({
    service: "https://bsky.social",
    session: {
      handle: tokenData.handle,
      active: !!tokenData.active,
      did: tokenData.did,
      accessJwt: tokenData.accessJwt,
      refreshJwt: tokenData.refreshJwt,
    },
  });
}

export async function logout() {
  const authenticatedAgent = await getAuthenticatedAgent();
  if (!authenticatedAgent) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  try {
    await authenticatedAgent.com.atproto.server.deleteSession();
  } catch (error) {
    console.error("Error destroying session:", error);
  } finally {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export async function fetchPosts(limit: number = 50) {
  try {
    console.log("agent.accountDid => ", agent.assertDid);

    if (!agent.assertDid) {
      throw new Error("Not authenticated");
    }

    // Fetch both timelines using the correct API methods
    const timelineResponse = await agent.getTimeline({ limit: limit * 2 });
    // agent.app.bsky.feed.getTimeline({ limit: limit * 2 }), // Using feed.getTimeline for discover

    console.log(
      "timelineResponse => ",
      JSON.stringify(timelineResponse, null, 2),
    );

    // Helper function to filter and format posts
    const formatPosts = (posts: any[]): BskyPost[] => {
      return posts
        .filter((item) => {
          return (
            item.post.embed?.$type === "app.bsky.embed.images#view" &&
            item.post.embed?.images?.length > 0
          );
        })
        .map((item) => ({
          uri: item.post.uri,
          cid: item.post.cid,
          author: {
            did: item.post.author.did,
            handle: item.post.author.handle,
            displayName: item.post.author.displayName,
            avatar: item.post.author.avatar,
          },
          record: {
            text: item.post.record.text,
            embed: item.post.record.embed,
          },
          embed: item.post.embed,
          likeCount: item.post.likeCount || 0,
          indexedAt: item.post.indexedAt,
        }));
    };

    const timelinePosts = formatPosts(timelineResponse.data.feed);

    return [...timelinePosts]
      .sort(
        (a, b) =>
          new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime(),
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export function getImageUrl(post: BskyPost): string | undefined {
  console.log(post);
  if (post.embed?.images?.[0].fullsize) {
    return post.embed?.images?.[0].fullsize;
  }
  return undefined;
}

export async function createPost(text: string, image?: string) {
  try {
    if (!agent.assertDid) {
      throw new Error("Not authenticated");
    }

    let imageData;
    if (image) {
      // Resize the image
      const resizedImage = await ImageResizer.createResizedImage(
        image,
        1024, // max width
        1024, // max height
        "JPEG", // format
        80, // quality
      );

      // Fetch the resized image data
      const response = await fetch(resizedImage.uri);
      const blob = await response.blob();

      // Convert Blob to Uint8Array using FileReader
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload the image
      const { data } = await agent.uploadBlob(uint8Array, {
        encoding: blob.type,
      });
      imageData = data.blob;
    }

    const response = await agent.post({
      text,
      createdAt: new Date().toISOString(),
      embed: imageData
        ? {
            $type: "app.bsky.embed.images",
            images: [
              {
                alt: text,
                image: imageData,
                aspectRatio: {
                  width: 1,
                  height: 1,
                },
              },
            ],
          }
        : undefined,
    });

    return response.uri;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

// Initialize the agent with the stored session data if it exists
(async () => {
  const tokenData = await getStoredToken();
  if (tokenData) {
    agent.session = {
      handle: tokenData.handle,
      active: !!tokenData.active,
      did: tokenData.did,
      accessJwt: tokenData.accessJwt,
      refreshJwt: tokenData.refreshJwt,
    };
  }
})();
