import React from "react";

const Avatar = ({ name, image, size = "md", isOnline, className = "" }) => {
  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  const selectedSize = sizes[size] || sizes.md;
  const initial = name?.charAt(0) || "?";

  return (
    <div className={`avatar ${isOnline ? "online" : "offline"} ${className}`}>
      <div className={`${selectedSize} bg-primary text-primary-content rounded-full flex items-center justify-center shadow-inner overflow-hidden uppercase font-bold`}>
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
