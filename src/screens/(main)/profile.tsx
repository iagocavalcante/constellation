import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAgent, useSession, useSessionApi } from "@/state/session";
import {
  fetchUserProfile,
  fetchUserPosts,
  getImageUrl,
} from "@/services/bsky.service";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { Icon } from "@/components/icon";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 3;

export default function Profile() {
  const agent = useAgent();
  const { currentAccount } = useSession();
  const { logoutCurrentAccount } = useSessionApi();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    loadProfile();
  }, [currentAccount]);

  const loadProfile = async () => {
    if (!currentAccount?.did) return;

    try {
      setLoading(true);
      const [profileData, postsData] = await Promise.all([
        fetchUserProfile(agent, currentAccount.did),
        fetchUserPosts(agent, currentAccount.did),
      ]);

      if (profileData) setProfile(profileData);
      setPosts(postsData.posts);
      setCursor(postsData.cursor);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !cursor || !currentAccount?.did) return;

    setLoadingMore(true);
    try {
      const { posts: newPosts, cursor: newCursor } = await fetchUserPosts(
        agent,
        currentAccount.did,
        30,
        cursor,
      );
      setPosts((prev) => [...prev, ...newPosts]);
      setCursor(newCursor);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logoutCurrentAccount("SignOutButtonPress");
            router.replace("/(auth)/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

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
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.uri}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.username}>
                {profile?.handle || currentAccount?.handle}
              </Text>
              <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Image
                source={{
                  uri:
                    profile?.avatar ||
                    "https://via.placeholder.com/80",
                }}
                style={styles.avatar}
              />
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {profile?.postsCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {profile?.followersCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {profile?.followsCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            {/* Display Name & Bio */}
            <View style={styles.bioSection}>
              {profile?.displayName && (
                <Text style={styles.displayName}>{profile.displayName}</Text>
              )}
              {profile?.description && (
                <Text style={styles.bio}>{profile.description}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Icon name="share" />
              </TouchableOpacity>
            </View>

            {/* Grid Header */}
            <View style={styles.gridHeader}>
              <TouchableOpacity style={styles.gridTab}>
                <Icon name="grid" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const imageUrl = getImageUrl(item);
          if (!imageUrl) return null;

          return (
            <TouchableOpacity style={styles.gridItem}>
              <Image source={{ uri: imageUrl }} style={styles.gridImage} />
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.loader} color="#8B5CF6" />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  username: {
    fontSize: 20,
    fontFamily: "Mulish_700Bold",
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FF3B30",
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Mulish_600SemiBold",
  },
  profileInfo: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 32,
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontFamily: "Mulish_700Bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  displayName: {
    fontSize: 14,
    fontFamily: "Mulish_700Bold",
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: "Mulish_600SemiBold",
  },
  shareButton: {
    backgroundColor: "#EFEFEF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  gridHeader: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#dbdbdb",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  gridTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: 1,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  loader: {
    padding: 20,
  },
});