import { lazy } from "react";

const Home = lazy(() => import("./home/Home.jsx"));
const Login = lazy(() => import("./auth/Login.jsx"));
const Register = lazy(() => import("./auth/Register.jsx"));
const Settings = lazy(() => import("./settings/Settings.jsx"));

export { Home, Login, Register, Settings };
