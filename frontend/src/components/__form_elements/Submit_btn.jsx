import React from "react";

const Submit_btn = ({ type, text, loading }) => {
  return (
    <button type={type} className="btn btn-primary">
      {loading && <span className="loading loading-spinner loading-xs"></span>}
      {loading ? "Loading..." : text}
    </button>
  );
};

export default Submit_btn;
