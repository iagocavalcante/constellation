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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useModalControls } from "@/state/modals";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 3;

export default function Profile() {
  const agent = useAgent();
  const { currentAccount } = useSession();
  const { logoutCurrentAccount } = useSessionApi();
  const { openModal } = useModalControls();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();

  // Determine which profile to show - from params or current user
  const profileDid = (params.did as string) || currentAccount?.did;
  const isOwnProfile = profileDid === currentAccount?.did;

  useEffect(() => {
    loadProfile();
  }, [currentAccount, params.did]);

  const loadProfile = async () => {
    if (!profileDid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [profileData, postsData] = await Promise.all([
        fetchUserProfile(agent, profileDid),
        fetchUserPosts(agent, profileDid),
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
    if (loadingMore || !cursor || !profileDid) return;

    setLoadingMore(true);
    try {
      const { posts: newPosts, cursor: newCursor } = await fetchUserPosts(
        agent,
        profileDid,
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

  const handleProfileMenu = () => {
    Alert.alert(
      "Profile Actions",
      "What would you like to do?",
      [
        {
          text: "Report Profile",
          style: "destructive",
          onPress: () => {
            if (profile) {
              openModal({
                name: "report-profile",
                did: profile.did,
                handle: profile.handle,
                displayName: profile.displayName,
              });
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
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
              {isOwnProfile ? (
                <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
                  <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleProfileMenu} style={styles.menuButton}>
                  <Text style={styles.menuIcon}>⋯</Text>
                </TouchableOpacity>
              )}
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


            {/* Legal Links Section (only for own profile) */}
            {isOwnProfile && (
              <View style={styles.legalSection}>
                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={() => router.push("/legal?type=terms")}
                >
                  <Text style={styles.legalLinkText}>Terms of Service</Text>
                  <Text style={styles.legalLinkArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={() => router.push("/legal?type=privacy")}
                >
                  <Text style={styles.legalLinkText}>Privacy Policy</Text>
                  <Text style={styles.legalLinkArrow}>›</Text>
                </TouchableOpacity>
              </View>
            )}

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
  menuButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
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
  legalSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
  },
  legalLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  legalLinkText: {
    fontSize: 14,
    color: "#0095f6",
  },
  legalLinkArrow: {
    fontSize: 20,
    color: "#999",
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