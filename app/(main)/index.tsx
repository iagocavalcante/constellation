import { View, StyleSheet } from "react-native";
import { Feed } from "@/components/feed";

export default function Home() {
  return (
    <View style={styles.container}>
      <Feed />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
