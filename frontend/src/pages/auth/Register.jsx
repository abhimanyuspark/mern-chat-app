import React, { useState } from "react";
import Input from "../../components/__form_elements/Input";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { register } from "../../redux/features/auth/authThunk";
import { Link, useNavigate } from "react-router";
import Submit_btn from "../../components/__form_elements/Submit_btn";
import { validator } from "../../utils/validator";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [fromError, setFormError] = useState(null);

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormError((p) => ({ ...p, [name]: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const { errors, validate } = validator(formData);

    if (validate) {
      setFormError(errors);
      return;
    }

    await toast.promise(dispatch(register(formData)).unwrap(), {
      loading: "loading...",
      success: () => {
        navigate("/", { replace: true });
        return "Successfull";
      },
      error: (err) => err,
    });
  };

  return (
    <div className="flex items-center justify-center pt-10">
      <div className="flex gap-8 flex-col">
        <div className="flex items-center justify-center">
          <h2 className="text-2xl font-bold">Register</h2>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-80">
          <Input
            name={"name"}
            placeholder={"Enter a name"}
            type={"text"}
            value={formData.name}
            onChange={onChange}
            label={"Name"}
            error={fromError?.name}
          />
          <Input
            name={"email"}
            placeholder={"Enter a email"}
            type={"email"}
            value={formData.email}
            onChange={onChange}
            label={"Email"}
            error={fromError?.email}
          />
          <Input
            name={"password"}
            placeholder={"Enter a password"}
            type={"password"}
            value={formData.password}
            onChange={onChange}
            label={"Password"}
            error={fromError?.password}
          />

          <br />

          <p>
            Already register{" "}
            <Link className="underline text-accent" to="/login">
              login
            </Link>
          </p>

          <br />

          <Submit_btn type={"submit"} loading={loading} text={"Submit"} />
        </form>
      </div>
    </div>
  );
};

export default Register;
