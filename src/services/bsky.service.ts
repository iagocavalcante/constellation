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
              width: 1024,
              height: 1024,
            },
          },
        ],
        {
          compress: 0.8, // 80% quality
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
