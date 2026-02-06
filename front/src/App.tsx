import React from "react";
import { Outlet } from "react-router";
import { Navbar } from "./components/Navbar"; // Assuming you have a Navbar component
import { Footer } from "./components/Footer"; // Assuming you have a Footer component
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Assuming you have an Auth context
import { Toaster } from "@/components/ui/sonner"; // Using shadcn toast component

// Define types for our props and state
interface AppProps {}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-blue-800">
      {/* Navigation Bar */}
      <Navbar user={user} />
      
      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
};

const App: React.FC<AppProps> = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;