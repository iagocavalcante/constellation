import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { signupToBsky } from "@/services/bsky.service";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

const DEFAULT_DATE = new Date(Date.now() - 60e3 * 60 * 24 * 365 * 20);

type FormData = {
  email: string;
  password: string;
  handle: string;
  inviteCode: string;
  dateOfBirth: string;
};

export default function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [signupData, setSignupData] = useState<FormData | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");

    try {
      const { email, password, handle, inviteCode, dateOfBirth } = data;
      const result = await signupToBsky({
        dateOfBirth,
        email,
        password,
        handle,
        inviteCode,
      });

      if (result.requiresVerification) {
        setSignupData(data);
        setVerificationNeeded(true);
        Alert.alert(
          "Verification Required",
          "We've sent a verification code to your email. Please check your inbox and enter the code to complete signup.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(auth)/verify"),
            },
          ],
        );
      } else if (result.success) {
        router.replace("/(main)");
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#8B5CF6", "#D946EF", "#F97316"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join the decentralized network
              </Text>
            </View>

            <View style={styles.form}>
              {error && <Text style={styles.errorText}>{error}</Text>}

              <Controller
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Email"
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
                name="email"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}

              <Controller
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Password"
                    style={styles.input}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="password"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <Controller
                control={control}
                rules={{
                  required: "Handle is required",
                  pattern: {
                    value: /^[a-zA-Z0-9.-]+$/,
                    message:
                      "Invalid handle format (use letters, numbers, . and -)",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Handle (e.g., yourname.bsky.social)"
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
                name="handle"
              />
              {errors.handle && (
                <Text style={styles.errorText}>{errors.handle.message}</Text>
              )}

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Invite Code"
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
                name="inviteCode"
              />
              {errors.inviteCode && (
                <Text style={styles.errorText}>
                  {errors.inviteCode.message}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#D946EF"]}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.signupContainer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                >
                  <Text style={styles.signupText}>Sign in</Text>
                </TouchableOpacity>
              </View>
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
    fontFamily: "Mulish_700Bold",
    fontSize: 28,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Mulish_600SemiBold",
    fontSize: 14,
    color: "#666",
  },
  form: {
    gap: 16,
  },
  input: {
    fontFamily: "Mulish_400Regular",
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
    fontFamily: "Mulish_700Bold",
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
    fontFamily: "Mulish_400Regular",
    fontSize: 14,
    color: "#666",
  },
  signupText: {
    fontFamily: "Mulish_600SemiBold",
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  forgotPassword: {
    padding: 4,
  },
  forgotPasswordText: {
    fontFamily: "Mulish_600SemiBold",
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontFamily: "Mulish_600SemiBold",
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
