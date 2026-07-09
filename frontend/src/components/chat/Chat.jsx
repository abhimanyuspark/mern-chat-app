import React from "react";
import Empty from "./Empty";

const Chat = ({ id, onClose }) => {
  return (
    <div>
      {id && (
        <div className="border-b border-gray-300 p-2">
          <button onClick={onClose}>Back</button>
        </div>
      )}

      {id ? <h2>{id}</h2> : <Empty />}
    </div>
  );
};

export default Chat;
