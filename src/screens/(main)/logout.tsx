import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useSessionApi } from "@/state/session";

export default function Logout() {
  const { logoutEveryAccount } = useSessionApi();
  const router = useRouter();
  useEffect(() => {
    const handleLogout = async () => {
      logoutEveryAccount("Settings");
      router.replace("/(auth)/login");
    };
    handleLogout();
  }, []);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
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
  },
});
