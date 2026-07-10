export const validator = (data) => {
  const errors = {};

  if ("name" in data) {
    if (data?.name === "") {
      errors.name = "Name is required";
    } else {
      if (data?.name.length < 4 || data?.name.length > 16) {
        errors.name = "Name must be between 4 and 16 characters";
      }
    }
  }

  if ("email" in data) {
    if (data?.email === "") {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data?.email)) {
        errors.email = "Invalid email format";
      }
    }
  }

  if ("password" in data) {
    if (data?.password === "") {
      errors.password = "Password is required";
    } else {
      if (data?.password.length < 4 || data?.password.length > 16) {
        errors.password = "Password must be between 4 and 16 characters";
      }
    }
  }

  const validate = Object.keys(errors).length > 0;

  return { errors, validate };
};
