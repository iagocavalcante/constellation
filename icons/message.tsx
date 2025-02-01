import React from "react";
import { Svg, Path } from "react-native-svg";

export const Message = ({
  color = "#878D98",
  size = 23,
  strokeWidth = 2,
  ...props
}) => (
  <Svg
    width={size}
    height={(size * 22) / 23}
    viewBox="0 0 23 22"
    fill="none"
    {...props}
  >
    <Path
      d="M17.5632 7.76782C17.5632 7.76782 14.0404 11.9958 11.4638 11.9958C8.88834 11.9958 5.32599 7.76782 5.32599 7.76782"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 11.005C1 3.50069 3.61291 1 11.4516 1C19.2904 1 21.9033 3.50069 21.9033 11.005C21.9033 18.5081 19.2904 21.0099 11.4516 21.0099C3.61291 21.0099 1 18.5081 1 11.005Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
