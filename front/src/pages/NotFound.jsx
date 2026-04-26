import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";

/**
 * NotFoundPage - 404 error page
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl font-bold text-gray-900">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            Go to Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
