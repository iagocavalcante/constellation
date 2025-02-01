import React from "react";
import icons from "@/icons";

interface IconProps {
  name: string;
  color?: string;
  size?: number;
  fill?: string;
  [key: string]: any;
}

const Icon: React.FC<IconProps> = ({ name, color, size, fill, ...props }) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon with name "${name}" does not exist.`);
    return null;
  }

  return <IconComponent color={color} size={size} fill={fill} {...props} />;
};

export default Icon;
