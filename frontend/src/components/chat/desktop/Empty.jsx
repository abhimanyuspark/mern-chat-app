import React from "react";
import { FiMessageSquare } from "react-icons/fi";

const Empty = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base-200/50">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
        <div className="bg-primary/10 p-6 rounded-full">
          <FiMessageSquare className="text-6xl text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Your Messages</h2>
          <p className="text-base-content/60">
            Select a conversation from the sidebar to start chatting or search for new friends to connect with.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Empty;
