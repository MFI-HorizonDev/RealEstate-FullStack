import { createRoot } from "react-dom/client";
import "./index.css"
import { routes } from "./Router/router";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={routes}/>
    </QueryClientProvider>
);
