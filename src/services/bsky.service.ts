import { useAgent } from "@/state/session";
import {
  AtpAgent,
  AtpSessionData,
  AtpSessionEvent,
  BskyAgent,
} from "@atproto/api";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";

const STORAGE_KEY = "@bsky_token";
const VERIFICATION_EMAIL_KEY = "@bsky_verification_email";

const agentInternal = new AtpAgent({
  service: "https://bsky.social",
  persistSession: async (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    if (sess) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  },
});

export type SignUpData = {
  email: string;
  password: string;
  handle: string;
  inviteCode?: string;
  dateOfBirth: string;
};

export interface SearchParams {
  q?: string;
  sort?: "top" | "latest";
  since?: string;
  until?: string;
  mentions?: string;
  author?: string;
  lang?: string;
  domain?: string;
  url?: string;
  tags?: string[];
  limit?: number;
  cursor?: string;
}

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

export function formatPosts(posts: PostView[]): PostView[] {
  return posts
    .filter((post) => {
      // Filter only posts with images
      return (
        (post.embed?.$type === "app.bsky.embed.images#view" ||
          post.embed?.$type === "app.bsky.embed.videos") &&
        post.embed?.images?.length > 0
      );
    })
    .map((post) => ({
      uri: post.uri,
      cid: post.cid,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      record: {
        text: post.record.text,
        embed: post.record.embed,
      },
      embed: post.embed!,
      likeCount: post.likeCount || 0,
      indexedAt: post.indexedAt,
    }));
}

export async function fetchPosts(
  agent: AtpAgent,
  limit: number = 50,
  cursor = "",
) {
  try {
    const timelineResponse = await agent.getTimeline({
      limit: limit * 2,
      cursor,
    });

    const formattedPosts = formatPosts(
      timelineResponse.data.feed.map((item) => item.post),
    );

    return {
      posts: formattedPosts
        .sort(
          (a, b) =>
            new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime(),
        )
        .slice(0, limit),
      cursor: timelineResponse.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      posts: [],
      cursor: undefined,
    };
  }
}

export function getImageUrl(post: PostView): string | undefined {
  console.log(post);
  if (post.embed?.images?.[0].fullsize) {
    return post.embed?.images?.[0].fullsize;
  }
  return undefined;
}

export async function createPost(
  agent: AtpAgent,
  text: string,
  image?: string | null,
) {
  try {
    let imageData;
    console.log(image);
    if (image) {
      // Resize the image using expo-image-manipulator
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        [
          {
            resize: {
              width: 2048,
            },
          },
        ],
        {
          compress: 1, // Maximum quality
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      // Fetch the resized image data
      const response = await fetch(manipulatedImage.uri);
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

export async function searchPosts(agent: AtpAgent, params: SearchParams) {
  try {
    const response = await agent.app.bsky.feed.searchPosts({
      q: params.q || "",
      limit: params.limit || 25,
      cursor: params.cursor,
      sort: params.sort || "latest",
    });

    const formattedPosts = formatPosts(response.data.posts);

    return {
      posts: formattedPosts,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error searching posts:", error);
    return {
      posts: [],
      cursor: undefined,
    };
  }
}

export async function likePost(agent: AtpAgent, uri: string, cid: string) {
  try {
    await agent.like(uri, cid);

    return true;
  } catch (error) {
    console.error("Error liking post:", error);
    return false;
  }
}

// Function to unlike a post
export async function unlikePost(agent: AtpAgent, uri: string) {
  try {
    // First, get the like record
    const { data: likes } = await agentInternal.app.bsky.feed.getLikes({
      uri,
      limit: 1,
      cursor: undefined,
    });

    // Find our like
    const myLike = likes.likes.find(
      (like) => like.actor.did === agentInternal.session?.did,
    );

    if (myLike) {
      // Delete the like record
      await agentInternal.deleteLike(myLike.uri as string);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error unliking post:", error);
    return false;
  }
}

// Add this function to check if a post is liked by the user
export async function isPostLikedByUser(
  agent: AtpAgent,
  uri: string,
): Promise<boolean> {
  try {
    const { data: likes } = await agent.app.bsky.feed.getLikes({
      uri,
      limit: 1,
      cursor: undefined,
    });

    return likes.likes.some((like) => like.actor.did === agent.session?.did);
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
}

export interface ReportParams {
  reasonType: string;
  subject: {
    $type: "com.atproto.repo.strongRef";
    uri: string;
    cid: string;
  };
}

export interface ReportProfileParams {
  reasonType: string;
  subject: {
    $type: "com.atproto.admin.defs#repoRef";
    did: string;
  };
}

// Function to report a post
export async function reportPost(
  agent: AtpAgent,
  params: ReportParams,
): Promise<boolean> {
  try {
    await agent.api.com.atproto.moderation.createReport({
      reasonType: params.reasonType,
      subject: params.subject,
    });

    return true;
  } catch (error) {
    console.error("Error reporting post:", error);
    return false;
  }
}

// Function to report a profile
export async function reportProfile(
  agent: AtpAgent,
  params: ReportProfileParams,
): Promise<boolean> {
  try {
    await agent.api.com.atproto.moderation.createReport({
      reasonType: params.reasonType,
      subject: params.subject,
    });

    return true;
  } catch (error) {
    console.error("Error reporting profile:", error);
    return false;
  }
}

// Function to fetch user profile
export async function fetchUserProfile(agent: AtpAgent, did: string) {
  try {
    const response = await agent.getProfile({ actor: did });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// Function to fetch user's posts (author feed)
export async function fetchUserPosts(
  agent: AtpAgent,
  did: string,
  limit: number = 30,
  cursor?: string,
) {
  try {
    const response = await agent.getAuthorFeed({
      actor: did,
      limit: limit * 2, // Fetch more to filter for images
      cursor,
    });

    const formattedPosts = formatPosts(
      response.data.feed.map((item) => item.post),
    );

    return {
      posts: formattedPosts.slice(0, limit),
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return {
      posts: [],
      cursor: undefined,
    };
  }
}

// Function to block a user
export async function blockUser(
  agent: AtpAgent,
  did: string,
): Promise<string | null> {
  try {
    const { uri } = await agent.app.bsky.graph.block.create(
      { repo: agent.session!.did },
      {
        subject: did,
        createdAt: new Date().toISOString(),
      },
    );
    return uri;
  } catch (error) {
    console.error("Error blocking user:", error);
    return null;
  }
}

// Function to unblock a user
export async function unblockUser(
  agent: AtpAgent,
  blockUri: string,
): Promise<boolean> {
  try {
    const { AtUri } = await import("@atproto/api");
    const { rkey } = new AtUri(blockUri);
    await agent.app.bsky.graph.block.delete({
      repo: agent.session!.did,
      rkey,
    });
    return true;
  } catch (error) {
    console.error("Error unblocking user:", error);
    return false;
  }
}

// Function to get blocked users
export async function getBlockedUsers(
  agent: AtpAgent,
  limit: number = 50,
  cursor?: string,
) {
  try {
    const response = await agent.app.bsky.graph.getBlocks({
      limit,
      cursor,
    });
    return {
      blocks: response.data.blocks,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return {
      blocks: [],
      cursor: undefined,
    };
  }
}

// Function to check if a user is blocked
export async function isUserBlocked(
  agent: AtpAgent,
  did: string,
): Promise<{ blocked: boolean; blockUri?: string }> {
  try {
    let cursor: string | undefined;
    let allBlocks: any[] = [];

    // Fetch all blocked users (may need pagination)
    do {
      const { blocks, cursor: nextCursor } = await getBlockedUsers(
        agent,
        100,
        cursor,
      );
      allBlocks = [...allBlocks, ...blocks];
      cursor = nextCursor;
    } while (cursor);

    const blockedUser = allBlocks.find((block) => block.did === did);
    return {
      blocked: !!blockedUser,
      blockUri: blockedUser?.uri,
    };
  } catch (error) {
    console.error("Error checking if user is blocked:", error);
    return { blocked: false };
  }
}

// Function to request account deletion
export async function requestAccountDeletion(
  agent: AtpAgent,
): Promise<boolean> {
  try {
    await agent.api.com.atproto.server.requestAccountDelete();
    return true;
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    return false;
  }
}

// Function to delete account
export async function deleteAccount(
  agent: AtpAgent,
  password: string,
  token: string,
): Promise<boolean> {
  try {
    await agent.api.com.atproto.server.deleteAccount({
      did: agent.session!.did,
      password,
      token,
    });
    return true;
  } catch (error) {
    console.error("Error deleting account:", error);
    return false;
  }
}
