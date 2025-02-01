import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { loginToBsky } from "../../services/bsky.service";
import { useAuthStore } from "../../stores/auth.store";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await loginToBsky(identifier, password);

      if (result.success && result.data) {
        login(result.data);
        router.replace("/(main)");
      } else if (result.isRateLimit) {
        // Handle rate limit specifically
        setError(result.error);
        // Maybe disable the login button for a few seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        setError(
          result.error || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#8B5CF6", "#D946EF", "#F97316"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Constellation</Text>
              <Text style={styles.subtitle}>
                Your decentralized photo sharing experience
              </Text>
            </View>

            <View style={styles.form}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Username (e.g., name.bsky.social) or Email"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  setError("");
                }}
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                secureTextEntry
                placeholderTextColor="#666"
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#D946EF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.signupContainer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.signupText}>Sign up</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212121",
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    gap: 16,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  signupText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  forgotPassword: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
