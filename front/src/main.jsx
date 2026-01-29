import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
// Path
import App from "./App.jsx";


const routes = createBrowserRouter([
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
]);

createRoot(document.getElementById("root")).render(
    <RouterProvider router={routes}/>
);
