
import { createBrowserRouter, RouterProvider } from "react-router";

// Path
import Login from "../login/login";
import Notfound from "../notfound";
import App from "../App";



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
    element: <App/>
  },
  {
    path: "Login",
    element: <Login/>
  },
  {
    path: "*",
    element: <Notfound/>
  },
]);

