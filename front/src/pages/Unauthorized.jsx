import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Lock } from "lucide-react";

/**
 * UnauthorizedPage - 403 unauthorized access page
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="text-center">
        <Lock className="w-16 h-16 mx-auto mb-4 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
