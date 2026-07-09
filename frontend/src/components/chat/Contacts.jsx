import React from "react";
import { useNavigate } from "react-router";

const Contacts = ({ onId }) => {
  const navigate = useNavigate();
  const onClick = (id) => {
    onId(id);
  };

  return (
    <div className="flex gap-2 flex-col p-2">
      {[1, 2, 3, 4].map((a, i) => (
        <div
          className="p-2 bg-amber-600 rounded-lg"
          key={i}
          onClick={() => {
            onClick(a);
          }}
        >
          {a}
        </div>
      ))}
    </div>
  );
};

export default Contacts;
