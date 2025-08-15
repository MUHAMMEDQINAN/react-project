import { createBrowserRouter } from "react-router";
import Login from "../../features/auth/pages/login/Login";
import Dashboard from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import Register from "../../features/auth/pages/register/register";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
   
  },
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      }
      
    ],
  },
]);
