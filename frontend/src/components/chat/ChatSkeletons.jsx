import React from "react";

export const ConversationSkeleton = () => {
  return (
    <div className="flex flex-col">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="skeleton h-12 w-12 shrink-0 rounded-full"></div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="skeleton h-4 w-1/3"></div>
            <div className="skeleton h-3 w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div className={`flex max-w-[75%] flex-col gap-1 ${i % 2 === 0 ? "items-start" : "items-end"}`}>
            <div className="skeleton h-10 w-48 rounded-2xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const UserSkeleton = () => {
  return (
    <div className="flex flex-col gap-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      ))}
    </div>
  );
};
