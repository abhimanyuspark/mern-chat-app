import React from "react";

const Input = ({
  label,
  name,
  value,
  onChange,
  type,
  error,
  placeholder,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        className={`input w-full ${error ? "input-error" : "input-primary"}`}
        {...props}
      />
      <p className="text-error font-medium text-sm leading-6">
        {error && error}
      </p>
    </div>
  );
};

export default Input;
