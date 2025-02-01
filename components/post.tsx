import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react-native";

interface PostProps {
  imageUrl?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  likes: number;
  comments: string;
  likedByAvatars?: string[];
  likedByNames?: string[];
}

const Post = ({
  imageUrl,
  username,
  displayName,
  avatar,
  likes,
  comments,
  likedByAvatars = [],
  likedByNames = [],
}: PostProps) => (
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
        <TouchableOpacity>
          <Text style={styles.moreOptions}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Main Image */}
      <Image source={{ uri: imageUrl }} style={styles.mainImage} />

      {/* Engagement Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Heart size={20} color="#000" />
          <Text style={styles.statText}>{likes}</Text>
        </View>
        <View style={styles.stat}>
          <MessageCircle size={20} color="#000" />
          <Text style={styles.statText}>{comments}</Text>
        </View>
        <View style={styles.stat}>
          <Send size={20} color="#000" />
        </View>
        <View style={styles.rightStat}>
          <Bookmark size={20} color="#000" />
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
});

export default Post;
