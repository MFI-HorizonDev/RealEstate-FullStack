import React, { useState } from "react";
import bgImage from "@/assets/bg.jpg"; 
import { useNavigate } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const userRoles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "User" },
  { id: 3, name: "Guest" },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [signup, setSignup] = useState(null);

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    if (!email || !password || !username || !first_name || !last_name) {
      setSignup(false);
      return;
    }

    setSignup(true);
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.55) 30%,
            rgba(20, 20, 30, 0.45) 50%,
            rgba(40, 30, 50, 0.35) 70%,
            rgba(60, 40, 70, 0.25) 85%,
            rgba(80, 50, 90, 0.15) 100%
          ),
          url(${bgImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20 pointer-events-none" />

      <Card className="w-full max-w-md bg-black/65 backdrop-blur-xl border border-amber-900/30 rounded-2xl shadow-2xl shadow-black/60 hover:shadow-amber-900/20 transition-all duration-500 transform hover:scale-[1.02]">
        <CardHeader className="space-y-1 pb-6 border-b border-amber-900/20">
          <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Join our exclusive community
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstname"
                  type="text"
                  placeholder="First Name"
                  onChange={(e) => setFirstname(e.target.value)}
                  className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
                />
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Last Name"
                  onChange={(e) => setLastname(e.target.value)}
                  className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
                />
              </div>

              <Input
                id="username"
                type="text"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
              />

              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
              />

              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
              />

              <Select>
                <SelectTrigger className="bg-black/40 border-amber-900/40 text-white data-[placeholder]:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-amber-900/40 text-white">
                  <SelectGroup>
                    {userRoles.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.name}
                        className="focus:bg-amber-950 focus:text-amber-300"
                      >
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white font-medium py-6 rounded-xl shadow-lg shadow-amber-900/30 hover:shadow-amber-700/40 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>


    </div>
  );
}