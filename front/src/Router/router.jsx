import { createBrowserRouter } from "react-router";

// Path
import Login from "../login/login";
import Notfound from "../notfound";
import App from "../App";
import Signup from "../login/signup";
import AdminAuditDashboard from "../pages/Admin/AdminAuditDashboard";
import TestPagination from "../pages/TestPagination";
export let routes = createBrowserRouter([
  // {
  //   path: "",
  //   element:
  //   children[
  //   {

  //   }
  // ],
  // },
  {
    path: "/",
    element: <App />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    element: <Signup />,
    path: "signup",
  },
  {
    path: "admin/audit-dashboard",
    element: <AdminAuditDashboard />,
  },
  {
    path: "test-pagination",
    element: <TestPagination />,
  },
  {
    path: "*",
    element: <Notfound />,
  },
]);