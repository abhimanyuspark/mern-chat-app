import React from "react";

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-base-100">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
