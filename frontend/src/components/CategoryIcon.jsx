import React from "react";
import * as Icons from "lucide-react";

const CategoryIcon = ({ name, size = 26, ...rest }) => {
  const IconComponent = Icons[name] || Icons.Tag;
  return <IconComponent size={size} {...rest} />;
};

export default CategoryIcon;
