import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Icon from "./icon";

const CustomTabBar = ({ state, navigation }) => {
  const windowWidth = Dimensions.get("window").width;

  const getIconComponent = (routeName, focused) => {
    switch (routeName) {
      case "index":
        return (
          <Icon
            name="home"
            color={focused ? "#000000" : "#878D98"}
            size={24}
            strokeWidth={2}
          />
        );
      case "search":
        return (
          <Icon
            name="search"
            color={focused ? "#000000" : "#878D98"}
            size={24}
            strokeWidth={2}
          />
        );
      case "new-post":
        return (
          <Icon name="add" color={focused ? "#000000" : "#878D98"} size={27} />
        );
      case "activity":
        return (
          <Icon
            name="heart"
            color={focused ? "#000000" : "#878D98"}
            size={27}
          />
        );
      case "profile":
        return (
          <Icon
            name="profile"
            color={focused ? "#000000" : "#878D98"}
            size={24}
            strokeWidth={2}
          />
        );
      default:
        return (
          <Icon
            name="home"
            color={focused ? "#000000" : "#878D98"}
            size={24}
            strokeWidth={2}
          />
        );
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
              {getIconComponent(route.name, isFocused)}
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
