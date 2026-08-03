import React, { useEffect, useRef } from "react";

const MessageContextMenu = ({
  x,
  y,
  onClose,
  onCopy,
  onReply,
  onDelete,
  isDeleted,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const menuWidth = 160;
  const menuHeight = isDeleted ? 80 : 160;
  let posX = x;
  let posY = y;

  if (x + menuWidth > window.innerWidth) {
    posX = x - menuWidth;
  }
  if (y + menuHeight > window.innerHeight) {
    posY = y - menuHeight;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-100 w-40 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-2xl"
      style={{ top: posY, left: posX }}
    >
      <div className="flex flex-col py-1">
        {!isDeleted && (
          <>
            <button
              onClick={() => {
                onReply();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-base-200"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current opacity-70">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
              </svg>
              Reply
            </button>
            <button
              onClick={() => {
                onCopy();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-base-200"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current opacity-70">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
              Copy
            </button>
          </>
        )}
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-2 text-left text-sm text-error hover:bg-base-200"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current opacity-70">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default MessageContextMenu;
