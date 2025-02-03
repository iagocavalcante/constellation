import React from "react";
import { Svg, Path } from "react-native-svg";

export const Bookmark = ({
  color = "#000000",
  size = 15,
  strokeWidth = 1.5,
  ...props
}) => (
  <Svg
    width={size}
    height={(size * 18) / 15}
    viewBox="0 0 15 18"
    fill="none"
    {...props}
  >
    <Path
      d="M4.40417 6.65701H10.1768"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.29073 1C1.9122 1 1.00357 1.78484 1.00357 8.09811C1.00357 15.1659 0.871363 17 2.21536 17C3.55852 17 5.7522 13.8977 7.29073 13.8977C8.82926 13.8977 11.0229 17 12.3661 17C13.7101 17 13.5779 15.1659 13.5779 8.09811C13.5779 1.78484 12.6693 1 7.29073 1Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
