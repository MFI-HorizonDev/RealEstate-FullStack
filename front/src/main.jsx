import { createRoot } from "react-dom/client";
import "./index.css"
import { routes } from "./Router/router";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <CookiesProvider>
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-right" richColors />
            <RouterProvider router={routes}/>
        </QueryClientProvider>
    </CookiesProvider>
);

