import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { TERMS_OF_SERVICE } from "@/legal/terms-of-service";
import { acceptTos } from "@/lib/tos";

export default function AcceptTermsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const redirectTo = (params.redirect as string) || "/(main)";

  const handleAccept = async () => {
    if (!accepted) return;

    setLoading(true);
    try {
      await acceptTos();

      // Navigate to the app
      router.replace(redirectTo as any);
    } catch (error) {
      console.error("Failed to save ToS acceptance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFull = () => {
    router.push("/legal?type=terms");
  };

  const handleViewPrivacy = () => {
    router.push("/legal?type=privacy");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Constel</Text>
        <Text style={styles.subtitle}>
          Please review and accept our Terms of Service to continue
        </Text>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: TERMS_OF_SERVICE }}
          style={styles.webview}
          scalesPageToFit={true}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the{" "}
            <Text style={styles.link} onPress={handleViewFull}>
              Terms of Service
            </Text>
            {" and "}
            <Text style={styles.link} onPress={handleViewPrivacy}>
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            <Text style={styles.noticeHighlight}>Zero Tolerance Policy: </Text>
            We have zero tolerance for objectionable content or abusive behavior.
            Violators will be immediately removed.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !accepted && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={!accepted || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Accept and Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Mulish_700Bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  webviewContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  link: {
    color: "#8B5CF6",
    textDecorationLine: "underline",
  },
  notice: {
    backgroundColor: "#fff3cd",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  noticeText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
  noticeHighlight: {
    fontWeight: "bold",
    color: "#d32f2f",
  },
  button: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Mulish_600SemiBold",
  },
});
