import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CircleCheckBig } from "lucide-react";

export default function AuthDebug() {
  const [testStatus, setTestStatus] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);
  const [signupStatus, setSignupStatus] = useState(null);
  const [error, setError] = useState("");

  const testBackend = async () => {
    try {
      setError("");
      setTestStatus("loading");
      const response = await fetch("http://127.0.0.1:8000/api/health/");
      const data = await response.json();
      console.log("Health check response:", data);
      
      if (response.ok) {
        setTestStatus("success");
      } else {
        setTestStatus("error");
        setError(JSON.stringify(data));
      }
    } catch (err) {
      console.error("Health check error:", err);
      setTestStatus("error");
      setError(err.message);
    }
  };

  const testLogin = async () => {
    try {
      setError("");
      setLoginStatus("loading");
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "superadmin@realestate.com",
          password: "superadmin123",
        }),
      });
      const data = await response.json();
      console.log("Login response:", data);
      
      if (response.ok) {
        setLoginStatus("success");
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        setError(`Success! Access Token: ${data.access.substring(0, 20)}...`);
      } else {
        setLoginStatus("error");
        setError(JSON.stringify(data));
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginStatus("error");
      setError(err.message);
    }
  };

  const testSignup = async () => {
    try {
      setError("");
      setSignupStatus("loading");
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: `testuser_${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          password: "Test123!@#",
          password_confirm: "Test123!@#",
          first_name: "Test",
          last_name: "User",
          role: "Buyer",
        }),
      });
      const data = await response.json();
      console.log("Signup response:", data);
      
      if (response.ok) {
        setSignupStatus("success");
        setError(`Success! User created: ${data.user.username}`);
        if (data.access) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
        }
      } else {
        setSignupStatus("error");
        setError(JSON.stringify(data));
      }
    } catch (err) {
      console.error("Signup error:", err);
      setSignupStatus("error");
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health Check */}
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Backend Health Check</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test if backend server is running at http://127.0.0.1:8000
              </p>
              <Button onClick={testBackend} className="w-full">
                {testStatus === "loading" ? "Testing..." : "Test Backend"}
              </Button>
              {testStatus === "success" && (
                <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
                  <CircleCheckBig className="h-4 w-4" />
                  <AlertTitle>Backend is running!</AlertTitle>
                  <AlertDescription>
                    Connected to backend successfully
                  </AlertDescription>
                </Alert>
              )}
              {testStatus === "error" && (
                <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Backend Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Login Test */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">2. Test Login</h3>
              <p className="text-sm text-gray-600 mb-4">
                Login as superadmin@realestate.com / superadmin123
              </p>
              <Button onClick={testLogin} className="w-full">
                {loginStatus === "loading" ? "Logging in..." : "Test Login"}
              </Button>
              {loginStatus === "success" && (
                <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
                  <CircleCheckBig className="h-4 w-4" />
                  <AlertTitle>Login Successful!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {loginStatus === "error" && (
                <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Signup Test */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">3. Test Signup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a new test account
              </p>
              <Button onClick={testSignup} className="w-full">
                {signupStatus === "loading" ? "Signing up..." : "Test Signup"}
              </Button>
              {signupStatus === "success" && (
                <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
                  <CircleCheckBig className="h-4 w-4" />
                  <AlertTitle>Signup Successful!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {signupStatus === "error" && (
                <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Signup Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Console Logs */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">Debug Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Open Browser DevTools (F12) and check Console tab</li>
                <li>• Make sure Django backend is running: python manage.py runserver</li>
                <li>• Check Network tab in DevTools to see API responses</li>
                <li>• Check that Database has been migrated: python manage.py migrate</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
