import { Tabs } from "expo-router";
import CustomTabBar from "../../components/custom-tab-bar";
import { useGlobalSearchParams } from "expo-router";

export default function TabLayout() {
  const { showCamera } = useGlobalSearchParams();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) =>
        showCamera === "true" ? null : <CustomTabBar {...props} />
      }
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="new-post" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
