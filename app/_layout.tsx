import { Stack } from "expo-router";
import { AuthGuard } from "../components/auth-guard";
import {
  Mulish_400Regular,
  Mulish_600SemiBold,
  Mulish_700Bold,
  useFonts,
} from "@expo-google-fonts/mulish";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Mulish_400Regular,
    Mulish_700Bold,
    Mulish_600SemiBold,
  });

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
