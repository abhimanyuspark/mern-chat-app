import React, { useState } from "react";
import Contacts from "../../components/chat/Contacts";
import Chat from "../../components/chat/Chat";

const Desktop = () => {
  const [id, setId] = useState(null);

  return (
    <div className="flex h-full w-full">
      <div className="shrink-0 w-xs bg-amber-200 h-full overflow-y-auto">
        <Contacts onId={setId} />
      </div>

      <div className="bg-amber-600 flex-1 overflow-y-auto">
        <Chat
          onClose={() => {
            setId(null);
          }}
          id={id}
        />
      </div>
    </div>
  );
};

export default Desktop;
