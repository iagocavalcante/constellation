import React from "react";
import { Svg, Path } from "react-native-svg";

export const Profile = ({
  color = "#878D98",
  size = 21,
  strokeWidth = 1.5,
  ...props
}) => (
  <Svg
    width={size}
    height={(size * 29) / 21}
    viewBox="0 0 21 29"
    fill="none"
    {...props}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 27.7349C5.37588 27.7349 1 26.9375 1 23.7441C1 20.5507 5.34812 17.6028 10.5 17.6028C15.6241 17.6028 20 20.5221 20 23.7156C20 26.9077 15.6519 27.7349 10.5 27.7349Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.4899 13.1775C13.8526 13.1775 16.5781 10.4521 16.5781 7.08939C16.5781 3.72672 13.8526 1 10.4899 1C7.12728 1 4.40052 3.72672 4.40052 7.08939C4.3892 10.4407 7.09573 13.1662 10.447 13.1775C10.4622 13.1775 10.4761 13.1775 10.4899 13.1775Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
