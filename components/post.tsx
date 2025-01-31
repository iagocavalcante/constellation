import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

interface PostProps {
  imageUrl: string;
  username: string;
  caption: string;
  likes: number;
}

const Post = ({ imageUrl, username, caption, likes }: PostProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{username}</Text>
      </View>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.footer}>
        <Text style={styles.likes}>{likes} likes</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  header: {
    padding: 10,
  },
  username: {
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  footer: {
    padding: 10,
  },
  likes: {
    fontWeight: "bold",
  },
  caption: {
    marginTop: 5,
  },
});

export default Post;
