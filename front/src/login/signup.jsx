import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useState } from "react";
import { useNavigate } from "react-router";

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

  const HandleSignup = (e) => {
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
    <>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4  bg-blue-800">
        <Card className="justify-center w-full max-w-sm bg-white">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your account</CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent>
            <form onClick={HandleSignup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Input
                    id="lastname"
                    type="text"
                    placeholder="Last Name"
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="firstname"
                    type="text"
                    placeholder="First Name"
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                      <SelectContent>
                        <SelectGroup>
                          {userRoles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                </div>
                <div>
                  <Button variant="default" className="w-full bg-amber-900">
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
