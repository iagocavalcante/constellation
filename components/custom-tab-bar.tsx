import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const CustomTabBar = ({ state, navigation }) => {
  const windowWidth = Dimensions.get("window").width;

  const getIconName = (routeName, focused) => {
    switch (routeName) {
      case "index":
        return focused ? "home" : "home-outline";
      case "search":
        return focused ? "search" : "search-outline";
      case "new-post":
        return focused ? "add-circle" : "add-circle-outline";
      case "activity":
        return focused ? "heart" : "heart-outline";
      case "profile":
        return focused ? "person-circle" : "person-circle-outline";
      default:
        return "home-outline";
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom curved background */}
      <View style={styles.backgroundContainer}>
        <Svg
          width={windowWidth}
          height={114}
          viewBox={`0 0 ${windowWidth} 114`}
          fill="none"
        >
          <Path
            d={`M0 40C0 17.9086 17.9086 0 40 0H${windowWidth - 40}C${windowWidth - 17.9086} 0 ${windowWidth} 17.9086 ${windowWidth} 40V114H0V40Z`}
            fill="white"
          />
        </Svg>
      </View>

      {/* Tab bar content */}
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => navigation.navigate(route.name)}
            >
              <Ionicons
                name={getIconName(route.name, isFocused)}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 114,
  },
  backgroundContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 34, // Adjust for safe area
    paddingHorizontal: 16,
    height: "100%",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CustomTabBar;
