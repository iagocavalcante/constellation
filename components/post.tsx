import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Heart,
  MessageCircle,
  Send,
  Home,
  Search,
  PlusSquare,
  Bookmark,
  User,
} from "lucide-react-native";

interface PostProps {
  imageUrl?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  caption: string;
  likes: number;
}

const Post = ({
  imageUrl,
  username,
  displayName,
  avatar,
  caption,
  likes,
}: PostProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{displayName || username}</Text>
          <Text style={styles.username}>@{username}</Text>
        </View>
      </View>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.footer}>
        <Text style={styles.likes}>{likes} likes</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
};

const PostNew = ({
  imageUrl,
  username,
  displayName,
  avatar,
  caption,
  likes,
}: PostProps) => (
  <View style={styles.post}>
    <View style={styles.postHeader}>
      <View style={styles.userInfo}>
        <Image source={{ uri: avatar }} style={styles.userAvatar} />
        <View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.location}>{displayName}</Text>
        </View>
      </View>
      <TouchableOpacity>
        <Text style={styles.moreOptions}>•••</Text>
      </TouchableOpacity>
    </View>

    <Image source={{ uri: imageUrl }} style={styles.postImage} />

    <View style={styles.postActions}>
      <View style={styles.leftActions}>
        <TouchableOpacity>
          <Heart size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MessageCircle size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Send size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Bookmark size={24} color="#000" />
      </TouchableOpacity>
    </View>

    <View style={styles.postStats}>
      <Text style={styles.likes}>{likes} likes</Text>
      <Text style={styles.comments}>{caption} comments</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  displayName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  footer: {
    padding: 10,
  },
  caption: {
    fontSize: 14,
  },

  container: {
    flex: 1,
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
  logoText: {
    fontSize: 24,
    fontFamily: "serif",
  },
  icon: {
    width: 24,
    height: 24,
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
  post: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
  },
  location: {
    fontSize: 12,
    color: "#666",
  },
  moreOptions: {
    fontSize: 16,
  },
  postImage: {
    width: "100%",
    height: 400,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  leftActions: {
    flexDirection: "row",
    gap: 16,
  },
  postStats: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likes: {
    fontWeight: "600",
    marginBottom: 4,
  },
  comments: {
    color: "#666",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#dbdbdb",
    backgroundColor: "#fff",
  },
});

export default PostNew;
