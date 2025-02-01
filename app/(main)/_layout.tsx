import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#e2e2e2",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Constellation",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "New Post",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: "Logout",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
