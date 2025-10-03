import React, { useLayoutEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { TERMS_OF_SERVICE } from "@/legal/terms-of-service";
import { PRIVACY_POLICY } from "@/legal/privacy-policy";

export default function LegalScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const type = params.type as string;

  const getTitle = () => {
    switch (type) {
      case "terms":
        return "Terms of Service";
      case "privacy":
        return "Privacy Policy";
      default:
        return "Legal";
    }
  };

  const getContent = () => {
    switch (type) {
      case "terms":
        return TERMS_OF_SERVICE;
      case "privacy":
        return PRIVACY_POLICY;
      default:
        return "<h1>Legal Document Not Found</h1>";
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getTitle(),
    });
  }, [navigation, type]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: getContent() }}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
});
