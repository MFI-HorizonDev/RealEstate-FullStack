import { createBrowserRouter } from "react-router";

// Path
import Login from "../login/login";
import Notfound from "../notfound";
import App from "../App";
import Signup from "../login/signup";
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
    path: "*",
    element: <Notfound />,
  },
]);