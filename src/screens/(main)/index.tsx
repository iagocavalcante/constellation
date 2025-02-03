import { View, StyleSheet } from "react-native";
import { Feed } from "@/components/feed";

export default function Search() {
  return (
    <View style={styles.container}>
      <Feed />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    fontFamily: "Mulish_400Regular",
    flex: 1,
    backgroundColor: "#fff",
  },
});
