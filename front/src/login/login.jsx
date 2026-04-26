import React, { useState } from "react";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import wowImage from "@/assets/wow.jpg";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginMutation } = useAuth();
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
    <div className="flex min-h-[calc(100vh-72px)] bg-background">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-muted">
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply z-10" />
        <img
          src={wowImage}
          alt="Premium Real Estate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
          <h2 className="text-4xl font-bold mb-4">Discover Your Next Home</h2>
          <p className="text-xl text-white/80 mb-8 max-w-lg">
            Join thousands of users finding their dream properties through our premium verified listings.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
              <span className="block text-2xl font-bold">10k+</span>
              <span className="text-sm text-white/80">Properties</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
              <span className="block text-2xl font-bold">5k+</span>
              <span className="text-sm text-white/80">Happy Users</span>
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
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition">
                Create one today
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={HandleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email or Username
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
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
                    className="h-12 bg-muted/50 border-border focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {login === false && error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {login === true && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Login successful! Redirecting...
                </div>
              )}

              <Button
                type="submit"
                disabled={login === null || login === true}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-all"
              >
                {login === null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
