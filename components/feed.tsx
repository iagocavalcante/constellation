import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Post from "./post";
import { fetchPosts, getImageUrl, BskyPost } from "../services/bsky.service";
import { useAuthStore } from "../stores/auth.store";
import { useRouter } from "expo-router";

export const Feed = () => {
  const [posts, setPosts] = useState<BskyPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const loadPosts = async () => {
    try {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      if (
        error instanceof Error &&
        error.message.includes("Not authenticated")
      ) {
        router.replace("/login");
      }
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
          avatar={item.author.avatar}
          imageUrl={getImageUrl(item)}
          caption={item.record.text}
          likes={item.likeCount}
        />
      )}
      keyExtractor={(item) =>
        item.uri + item.cid + Math.random().toString(36).substring(7)
      }
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
