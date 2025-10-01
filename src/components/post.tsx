import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Icon } from "./icon";
import {
  isPostLikedByUser,
  likePost,
  unlikePost,
} from "@/services/bsky.service";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";
import { useAgent } from "@/state/session";
import { useModalControls } from "@/state/modals";

interface PostProps {
  uri: string;
  cid: string;
  imageUrl?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  likes: number;
  comments: string;
  likedByAvatars?: string[];
  likedByNames?: string[];
  authorDid: string;
}

const Post = ({
  uri,
  cid,
  imageUrl,
  username,
  displayName,
  avatar,
  likes,
  comments,
  likedByAvatars = [],
  likedByNames = [],
  authorDid,
}: PostProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [lastTap, setLastTap] = useState(0);
  const DOUBLE_TAP_DELAY = 300;
  const agent = useAgent();
  const { openModal } = useModalControls();

  useEffect(() => {
    const checkLikeStatus = async () => {
      const liked = await isPostLikedByUser(agent, uri);
      setIsLiked(liked);
    };
    checkLikeStatus();
  }, [uri]);

  const heartScale = useSharedValue(0);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const handleDoubleTap = async () => {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        // Animate heart
        heartScale.value = withSequence(
          withSpring(1, { damping: 5, stiffness: 400 }),
          withSpring(0, { damping: 5, stiffness: 400 }, () => {
            heartScale.value = 0;
          }),
        );

        const success = await likePost(agent, uri, cid);
        if (success) {
          setIsLiked(true);
          setLikesCount((prev) => prev + 1);
        }
      }
    }
    setLastTap(now);
  };

  const handleLikePress = async () => {
    if (isLiked) {
      const success = await unlikePost(agent, uri);
      if (success) {
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } else {
      const success = await likePost(agent, uri, cid);
      if (success) {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }
  };

  const handleOptionsPress = () => {
    Alert.alert(
      "Post Options",
      "What would you like to do?",
      [
        {
          text: "Report Post",
          onPress: () => {
            openModal({
              name: "report-post",
              uri,
              cid,
              authorDid,
            });
          },
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.location}>{displayName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleOptionsPress}>
            <Text style={styles.moreOptions}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Main Image with double tap */}
        <TouchableWithoutFeedback onPress={handleDoubleTap}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.mainImage} />
            <Animated.View style={[styles.heartOverlay, heartStyle]}>
              <Icon name="heart" size={80} color="#fff" filled />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        {/* Engagement Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.stat} onPress={handleLikePress}>
            <Icon
              name="heart"
              filled={isLiked}
              size={20}
              color={isLiked ? "#E31B23" : "#000"}
            />
            <Text style={styles.statText}>{likesCount}</Text>
          </TouchableOpacity>
          <View style={styles.stat}>
            <Icon name="comment" size={20} color="#000" />
            <Text style={styles.statText}>{comments}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="send" size={20} color="#000" />
          </View>
          <View style={styles.rightStat}>
            <Icon name="bookmark" size={20} color="#000" />
          </View>
        </View>

        {/* Liked By Section */}
        <View style={styles.likedBySection}>
          <View style={styles.likedByAvatars}>
            {likedByAvatars.slice(0, 3).map((avatarUrl, index) => (
              <Image
                key={index}
                source={{ uri: avatarUrl }}
                style={[
                  styles.likedByAvatar,
                  { marginLeft: index > 0 ? -10 : 0 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.likedByText}>{likedByNames.join(", ")}...</Text>
          <TouchableOpacity>
            <Text style={styles.moreButton}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "Mulish_400Regular",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  moreOptions: {
    fontSize: 20,
    color: "#666",
  },
  mainImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 15,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  rightStat: {
    marginLeft: "auto",
  },
  statText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "500",
  },
  likedBySection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  likedByAvatars: {
    flexDirection: "row",
    marginRight: 8,
  },
  likedByAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  likedByText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  moreButton: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  heartOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -40 }],
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Post;
