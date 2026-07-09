import React from "react";

const Empty = () => {
  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <div className="pt-40 flex gap-2 flex-col items-center justify-center">
        <h2 className="animate-bounce">Chat App</h2>
        <p className="text-base font-semibold">Start Chatting...</p>
      </div>
    </div>
  );
};

export default Empty;
