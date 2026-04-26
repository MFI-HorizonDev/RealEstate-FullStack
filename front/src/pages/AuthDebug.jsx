import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CircleCheckBig } from "lucide-react";
import { API_BASE_URL, BASE_URL } from "@/hooks/api/config";

export default function AuthDebug() {
  const [testStatus, setTestStatus] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);
  const [signupStatus, setSignupStatus] = useState(null);
  const [healthMessage, setHealthMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [signupMessage, setSignupMessage] = useState("");

  const testBackend = async () => {
    try {
      setHealthMessage("");
      setTestStatus("loading");
      const response = await fetch(`${API_BASE_URL}/health/?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }
      console.log("Health check response:", { status: response.status, data, raw });
      
      if (response.ok) {
        setTestStatus("success");
        setHealthMessage(
          data?.message
            ? String(data.message)
            : `OK (HTTP ${response.status})`
        );
      } else {
        setTestStatus("error");
        setHealthMessage(
          data
            ? JSON.stringify(data)
            : `HTTP ${response.status}: ${raw?.slice?.(0, 300) || "No response body"}`
        );
      }
    } catch (err) {
      console.error("Health check error:", err);
      setTestStatus("error");
      setHealthMessage(err.message || "Failed to fetch");
    }
  };

  const testLogin = async () => {
    try {
      setLoginMessage("");
      setLoginStatus("loading");
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
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
        setLoginMessage(`Success! Access Token: ${data.access.substring(0, 20)}...`);
      } else {
        setLoginStatus("error");
        setLoginMessage(JSON.stringify(data));
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginStatus("error");
      setLoginMessage(err.message || "Failed to fetch");
    }
  };

  const testSignup = async () => {
    try {
      setSignupMessage("");
      setSignupStatus("loading");
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
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
        setSignupMessage(`Success! User created: ${data.user.username}`);
        if (data.access) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
        }
      } else {
        setSignupStatus("error");
        setSignupMessage(JSON.stringify(data));
      }
    } catch (err) {
      console.error("Signup error:", err);
      setSignupStatus("error");
      setSignupMessage(err.message || "Failed to fetch");
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
                Test if backend server is running at {BASE_URL}
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
                  <AlertDescription>{healthMessage}</AlertDescription>
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
                  <AlertDescription>{loginMessage}</AlertDescription>
                </Alert>
              )}
              {loginStatus === "error" && (
                <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{loginMessage}</AlertDescription>
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
                  <AlertDescription>{signupMessage}</AlertDescription>
                </Alert>
              )}
              {signupStatus === "error" && (
                <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Signup Failed</AlertTitle>
                  <AlertDescription>{signupMessage}</AlertDescription>
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
