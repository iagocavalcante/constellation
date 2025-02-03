import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Post from "./post";
import { fetchPosts, getImageUrl, BskyPost } from "../services/bsky.service";
import { useAuthStore } from "../stores/auth.store";
import { useRouter } from "expo-router";
import { Icon } from "./icon";
import { useAgent } from "@/state/session";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity>
      <Icon name="add" />
    </TouchableOpacity>
    <Text style={styles.logoText}>Constel</Text>
    <TouchableOpacity>
      <Icon name="message" />
    </TouchableOpacity>
  </View>
);

const Stories = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.storiesContainer}
  >
    <View style={styles.storyItem}>
      <View style={styles.addStoryButton}>
        <Text style={styles.plusIcon}>+</Text>
      </View>
      <Text style={styles.storyUsername}>My Story</Text>
    </View>
    {["Lina", "Ahmed", "Jenny", "Linda"].map((name, index) => (
      <View key={index} style={styles.storyItem}>
        <View style={styles.storyRing}>
          <Image
            source={{
              uri: `https://v0.dev/placeholder.svg?height=60&width=60`,
            }}
            style={styles.storyImage}
          />
        </View>
        <Text style={styles.storyUsername}>{name}</Text>
      </View>
    ))}
  </ScrollView>
);

export const Feed = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const agent = useAgent();

  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchPosts(agent);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !cursor) return;

    setLoading(true);
    try {
      const response = await fetchPosts(agent, 25, cursor);
      setPosts((prev) => [...prev, ...response.posts]);
      setCursor(response.cursor);
    } catch (error) {
      console.error("Load more error:", error);
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
    <SafeAreaView style={styles.container}>
      <FlatList
        style={{ paddingTop: 10 }}
        data={posts}
        renderItem={({ item }) => (
          <Post
            username={item.author.handle}
            displayName={item.author.displayName}
            avatar={item.author.avatar}
            uri={item.uri}
            cid={item.cid}
            imageUrl={getImageUrl(item)}
            caption={item.record.text}
            likes={item.likeCount as number}
          />
        )}
        keyExtractor={(item) =>
          item.uri + item.cid + Math.random().toString(36).substring(7)
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color="#8B5CF6" />
          ) : null
        }
        ListHeaderComponent={() => (
          <>
            <Header />
            {/* <Stories /> */}
          </>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  logoText: {
    fontSize: 24,
    fontFamily: "Mulish_700Bold",
  },
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storiesContainer: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  storyItem: {
    alignItems: "center",
    marginRight: 16,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#e95950",
    padding: 2,
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addStoryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    fontSize: 24,
    color: "#000",
  },
  storyUsername: {
    marginTop: 4,
    fontSize: 12,
  },
  loader: {
    padding: 20,
  },
});
