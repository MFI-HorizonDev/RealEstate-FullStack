import { createRoot } from "react-dom/client";
import "./index.css"
import { routes } from "./Router/router";
import { createBrowserRouter, RouterProvider } from "react-router";

createRoot(document.getElementById("root")).render(
    <RouterProvider router={routes}/>
);
