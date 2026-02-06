import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Outlet } from "react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CircleCheckBig } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(null);

  const navigate = useNavigate();

  const HandleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setLogin(false);
      return;
    }
    setLogin(true);

    // {This is use for delay}

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (

    <>
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-blue-800">
      <Card className="w-full max-w-sm bg-white">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter Email and Password</CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={HandleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full bg-amber-900">
                Login
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2 ">
          <Button variant="outline" className="w-full bg-gray-800 text-white">
            Login with Email
          </Button>
        </CardFooter>
      </Card>
      {login === true && (
        <Alert className="max-w-sm">
          <CircleCheckBig className="h-4 w-4" />
          <AlertTitle>Login Successful</AlertTitle>
          <AlertDescription>You are now logged in.</AlertDescription>
        </Alert>
      )}

      {login === false && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Login Failed</AlertTitle>
          <AlertDescription>
            Please enter both email and password.
          </AlertDescription>
        </Alert>
      )}
    </div>
    </>
  );
}
