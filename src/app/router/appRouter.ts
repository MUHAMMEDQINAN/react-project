import { createBrowserRouter } from "react-router";
import Layout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,

    children: [
      {
        path: "/home",

        Component: AuthLayout,
      },
    ],
  },
  {
    path: "/login",
    index: true,
    Component : AuthLayout
  },
]);
