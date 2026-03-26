import { createBrowserRouter } from "react-router";

// Path
import Login from "../login/login";
import Notfound from "../notfound";
import App from "../App";
import Signup from "../login/signup";
import Dashboard from "../pages/Agent/Dashboard";
import Home from "../pages/Home";
import About from "../pages/about-us";
import Profile from "../pages/Profile";

export let routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: <Notfound />,
  },
]);
