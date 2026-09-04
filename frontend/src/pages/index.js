import { lazy } from "react";

const Home = lazy(() => import("./home/Home.jsx"));
const Login = lazy(() => import("./auth/Login.jsx"));
const Register = lazy(() => import("./auth/Register.jsx"));
const Settings = lazy(() => import("./settings/Settings.jsx"));
const GroupInfo = lazy(() => import("./chat/GroupInfo.jsx"));
const CreateGroup = lazy(() => import("./chat/CreateGroup.jsx"));

export { Home, Login, Register, Settings, GroupInfo, CreateGroup };
