import React from "react";
import { Svg, Path } from "react-native-svg";

export const Add = ({
  color = "#878D98",
  size = 26,
  strokeWidth = 1.5,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 26 26" fill="none" {...props}>
    <Path
      d="M8.49671 13.0599H17.9491M13.3859 8.4967V17.9491"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 13.0599C1 22.1042 4.01563 25.1198 13.0599 25.1198C22.1042 25.1198 25.1198 22.1042 25.1198 13.0599C25.1198 4.01563 22.1042 1 13.0599 1C4.01563 1 1 4.01563 1 13.0599Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
