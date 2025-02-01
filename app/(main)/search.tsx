import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Camera, Play, ShoppingBag } from "lucide-react-native";
import { searchPosts, getImageUrl } from "@/services/bsky.service";
import Post from "@/components/post";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [isSearchMode, setIsSearchMode] = useState(false);

  const categories = [
    { id: 1, name: "Reels", icon: Play },
    { id: 2, name: "IGTV", icon: Play },
    { id: 3, name: "Store", icon: ShoppingBag },
    { id: 4, name: "Games", icon: ShoppingBag },
  ];

  const exploreImages = [
    {
      id: 1,
      url: "https://v0.dev/placeholder.svg?height=300&width=400",
      span: "half",
    },
    {
      id: 2,
      url: "https://v0.dev/placeholder.svg?height=600&width=400",
      span: "full",
    },
    {
      id: 3,
      url: "https://v0.dev/placeholder.svg?height=300&width=400",
      span: "half",
    },
    {
      id: 4,
      url: "https://v0.dev/placeholder.svg?height=300&width=400",
      span: "half",
    },
    {
      id: 5,
      url: "https://v0.dev/placeholder.svg?height=300&width=400",
      span: "half",
    },
    {
      id: 6,
      url: "https://v0.dev/placeholder.svg?height=300&width=400",
      span: "half",
    },
  ];

  let searchTimeout: NodeJS.Timeout;

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length === 0) {
      setIsSearchMode(false);
      setPosts([]);
      return;
    }

    setIsSearchMode(true);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchPosts({
          q: text,
          limit: 25,
        });
        // Posts are already formatted and filtered for media content
        setPosts(response.posts);
        setCursor(response.cursor);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const loadMore = async () => {
    if (loading || !cursor || !searchQuery) return;

    setLoading(true);
    try {
      const response = await searchPosts({
        q: searchQuery,
        limit: 25,
        cursor,
      });
      setPosts((prev) => [...prev, ...response.posts]);
      setCursor(response.cursor);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (isSearchMode) {
      return (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <Post
              uri={item.uri}
              cid={item.cid}
              username={item.author.handle}
              displayName={item.author.displayName}
              avatar={item.author.avatar}
              imageUrl={getImageUrl(item)}
              caption={item.record.text}
              likes={item.likeCount}
            />
          )}
          keyExtractor={(item) => item.uri}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={styles.loader} color="#8B5CF6" />
            ) : null
          }
        />
      );
    }

    return (
      <>
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryButton}>
              <category.icon size={20} color="#000" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Image Grid */}
        <ScrollView>
          <View style={styles.gridContainer}>
            <View style={styles.gridColumn}>
              {exploreImages
                .filter((_, index) => index % 2 === 0)
                .map((image) => (
                  <TouchableOpacity
                    key={image.id}
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{ uri: image.url }}
                      style={[
                        styles.image,
                        image.span === "full" && styles.fullImage,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
            </View>
            <View style={styles.gridColumn}>
              {exploreImages
                .filter((_, index) => index % 2 === 1)
                .map((image) => (
                  <TouchableOpacity
                    key={image.id}
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{ uri: image.url }}
                      style={[
                        styles.image,
                        image.span === "full" && styles.fullImage,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingTop: 50,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 8,
    paddingLeft: 16,
    fontSize: 16,
  },
  cameraButton: {
    padding: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  gridContainer: {
    flexDirection: "row",
    padding: 2,
  },
  gridColumn: {
    flex: 1,
    padding: 2,
  },
  imageContainer: {
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  fullImage: {
    height: 400,
  },
  loader: {
    padding: 20,
  },
});
