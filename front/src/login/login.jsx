import React, { useState } from "react";
import { useAuth } from "../services/api/useAuth";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginMutation } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [login, setLogin] = useState(false);

  const HandleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email/username and password.");
      setLogin(false);
      return;
    }
    try {
      setLogin(null); // Loading state
      await loginMutation.mutateAsync({ email, password });
      setLogin(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setLogin(false);
      if (err instanceof Error) {
        setError(err.message);
      } else if (err.detail) {
        setError(err.detail);
      } else {
        setError("Network error. Is the backend server running?");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-white">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10" />
        <img
          src="/src/assets/wow.jpg"
          alt="Premium Real Estate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
          <h2 className="text-4xl font-bold mb-4">Discover Your Next Home</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-lg">
            Join thousands of users finding their dream properties through our premium verified listings.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
              <span className="block text-2xl font-bold">10k+</span>
              <span className="text-sm text-gray-200">Properties</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
              <span className="block text-2xl font-bold">5k+</span>
              <span className="text-sm text-gray-200">Happy Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Link to="/" className="w-14 h-14 bg-amber-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-amber-800 transition-colors cursor-pointer">
                <span className="font-bold text-2xl">RE</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-blue-800 hover:text-blue-700 transition">
                Create one today
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={HandleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email or Username
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 focus:border-blue-800 focus:ring-blue-800/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-blue-800 focus:ring-blue-800/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {login === false && error && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {login === true && (
                <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Login successful! Redirecting...
                </div>
              )}

              <Button
                type="submit"
                disabled={login === null || login === true}
                className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-lg transition-all"
              >
                {login === null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}