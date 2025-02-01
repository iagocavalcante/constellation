import React from "react";
import { Svg, Path } from "react-native-svg";

export const Comment = ({ color = "#000000", size = 21, ...props }) => (
  <Svg
    width={size}
    height={(size * 20) / 21}
    viewBox="0 0 21 20"
    fill="none"
    {...props}
  >
    <Path
      d="M10.906 0.5C4.40324 0.5 -0.0271717 7.08895 2.42632 13.1111L3.4752 15.6857C3.56905 15.916 3.50044 16.1807 3.30649 16.3365L1.08856 18.1177C0.90245 18.2671 0.830938 18.5178 0.910158 18.7429C0.989379 18.9681 1.20208 19.1187 1.44077 19.1187H10.2386C15.6642 19.1187 20.0625 14.7204 20.0625 9.29485C20.0625 4.43759 16.1249 0.5 11.2676 0.5H10.906Z"
      fill={color}
    />
  </Svg>
);
