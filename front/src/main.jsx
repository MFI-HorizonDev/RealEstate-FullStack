import { createRoot } from "react-dom/client";
import "./index.css"
import { routes } from "./Router/router";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeProvider";

const queryClient = new QueryClient();
const rootEl = document.getElementById("root");

createRoot(rootEl).render(
    <ThemeProvider defaultTheme="system" storageKey="re-ui-theme">
        <CookiesProvider>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <Toaster 
                        position="top-right" 
                        richColors 
                        closeButton 
                        expand={false}
                        toastOptions={{
                            className: "rounded-xl shadow-lg border border-border font-medium",
                            duration: 4000,
                        }}
                    />
                    <RouterProvider router={routes}/>
                </QueryClientProvider>
            </AuthProvider>
        </CookiesProvider>
    </ThemeProvider>
);

