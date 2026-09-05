import React, { useState, useEffect } from "react";

const Avatar = ({ name, src, image, size = "md", isOnline, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = src || image;

  useEffect(() => {
    setImgError(false);
  }, [avatarSrc]);

  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  const selectedSize = sizes[size] || sizes.md;
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={`avatar ${
        isOnline !== undefined ? (isOnline ? "online" : "offline") : ""
      } ${className}`}
    >
      <div
        className={`${selectedSize} bg-primary text-primary-content rounded-full flex items-center justify-center shadow-inner overflow-hidden font-bold select-none`}
      >
        {avatarSrc && !imgError ? (
          <img
            src={avatarSrc}
            alt={name || "Avatar"}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
