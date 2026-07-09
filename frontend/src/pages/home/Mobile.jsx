import React, { useState } from "react";
import Contacts from "../../components/chat/Contacts";
import Chat from "../../components/chat/Chat";
import useBackButton from "../../hooks/useBackButton";

const Mobile = () => {
  const [id, setId] = useState(null);
  useBackButton(id, () => {
    setId(null);
  });

  return (
    <div>
      <div className="overflow-y-auto h-full">
        <Contacts onId={setId} />
      </div>

      <div
        className={`bg-amber-600 flex-1 overflow-y-auto z-50 fixed top-0 ${id ? "left-0" : "left-full"} duration-100 size-full`}
      >
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

export default Mobile;
