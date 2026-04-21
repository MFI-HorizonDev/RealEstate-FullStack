import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSignup } from "@/services/api/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

const userRoles = [
  { id: 1, name: "Buyer" },
  { id: 2, name: "Agent" },
  { id: 3, name: "Owner" },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [role, setRole] = useState("");
  
  const [signup, setSignup] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const signupMutation = useSignup();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !username || !first_name || !last_name || !role || !passwordConfirm) {
      setSignup(false);
      setError("Please fill in all fields");
      return;
    }

    if (password !== passwordConfirm) {
      setSignup(false);
      setError("Passwords do not match");
      return;
    }

    try {
      setSignup(null); // Loading state
      await signupMutation.mutateAsync({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name,
        last_name,
        role,
      });
      setSignup(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setSignup(false);
      let errorMsg = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        if (err.data) {
          if (err.data.username) errorMsg = Array.isArray(err.data.username) ? err.data.username[0] : err.data.username;
          else if (err.data.email) errorMsg = Array.isArray(err.data.email) ? err.data.email[0] : err.data.email;
          else if (err.data.password) errorMsg = Array.isArray(err.data.password) ? err.data.password[0] : err.data.password;
          else if (err.data.detail) errorMsg = err.data.detail;
          else errorMsg = err.message;
        } else {
          errorMsg = err.message;
        }
      }
      setError(errorMsg);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-white">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Link to="/" className="w-14 h-14 bg-amber-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-amber-800 transition-colors cursor-pointer">
                <span className="font-bold text-2xl">RE</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-800 hover:text-blue-700 transition">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-sm font-medium text-gray-900">First Name</Label>
                  <Input id="firstname" value={first_name} onChange={(e) => setFirstname(e.target.value)} className="h-11 bg-gray-50 focus:border-blue-800 focus:ring-blue-800/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-sm font-medium text-gray-900">Last Name</Label>
                  <Input id="lastname" value={last_name} onChange={(e) => setLastname(e.target.value)} className="h-11 bg-gray-50 focus:border-blue-800 focus:ring-blue-800/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-900">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-11 bg-gray-50 focus:border-blue-800 focus:ring-blue-800/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-gray-50 focus:border-blue-800 focus:ring-blue-800/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-gray-50 pr-10 focus:border-blue-800 focus:ring-blue-800/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordconfirm" className="text-sm font-medium text-gray-900">Confirm</Label>
                  <Input
                    id="passwordconfirm"
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="h-11 bg-gray-50 focus:border-blue-800 focus:ring-blue-800/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 bg-gray-50 focus:border-blue-800 focus:ring-blue-800/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {userRoles.map((roleOption) => (
                        <SelectItem key={roleOption.id} value={roleOption.name}>
                          {roleOption.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {signup === false && error && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 mt-4">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {signup === true && (
                <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium mt-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Account created! Redirecting...
                </div>
              )}

              <Button
                type="submit"
                disabled={signupMutation.isPending || signup === true}
                className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-lg transition-all mt-6"
              >
                {signupMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10" />
        <img
          src="/src/assets/bg.jpg"
          alt="Premium Real Estate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-white text-center w-full px-12">
          <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-xl text-gray-200">
            Join the fastest growing real estate platform in the country.
          </p>
        </div>
      </div>
    </div>
  );
}