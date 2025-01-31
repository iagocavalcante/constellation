import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Post from "./post";
import { fetchTimeline, BskyPost } from "../services/bsky.service";

interface PostData {
  id: string;
  imageUrl: string;
  username: string;
  caption: string;
  likes: number;
}

export const Feed = () => {
  const [posts, setPosts] = useState<BskyPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const timelinePosts = await fetchTimeline();
      setPosts(timelinePosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={posts}
      renderItem={({ item }) => (
        <Post
          username={item.author.handle}
          displayName={item.author.displayName}
          avatarUrl={item.author.avatar}
          imageUrl={
            item.record.embed?.images?.[0]?.image?.ref?.$link
              ? `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${item.author.did}&cid=${item.record.embed.images[0].image.ref.$link}`
              : undefined
          }
          caption={item.record.text}
          likes={item.likeCount}
          timestamp={new Date(item.indexedAt)}
        />
      )}
      keyExtractor={(item) => item.uri}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
