import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bgImage from "@/assets/bg.jpg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CircleCheckBig } from "lucide-react";

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

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <>
      <div
        className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.70) 0%,
              rgba(0, 0, 0, 0.60) 25%,
              rgba(15, 10, 25, 0.50) 50%,
              rgba(30, 20, 40, 0.40) 70%,
              rgba(50, 30, 60, 0.30) 85%,
              rgba(70, 40, 80, 0.20) 100%
            ),
            url(${bgImage})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/25 pointer-events-none" />



        <Card className="w-full max-w-md bg-black/70 backdrop-blur-xl border border-amber-900/30 rounded-2xl shadow-2xl shadow-black/60 hover:shadow-amber-900/30 transition-all duration-500 transform hover:scale-[1.02]">
          <CardHeader className="space-y-1 pb-6 border-b border-amber-900/20">
            <CardTitle className="text-3xl font-bold text-center text-white tracking-light">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={HandleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-amber-900/40 text-white placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-600/30 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white font-medium py-6 rounded-xl shadow-lg shadow-amber-900/30 hover:shadow-amber-700/40 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-amber-900/20 pt-6">
            <Button
              variant="outline"
              className="w-full border-amber-900/50 text-amber-600 hover:bg-amber-950 hover:text-amber-500 transition-colors"
              onClick={() => navigate("/signup")}
            >
              Don't have an account? Sign Up
            </Button>

            <Button
              variant="outline"
              className="w-full bg-black/40 border-amber-900/40 text-blue-300 hover:bg-black/60"
              disabled
            >
              Login with Email (coming soon)
            </Button>
          </CardFooter>
        </Card>

        {login === true && (
          <Alert className="max-w-md mt-6 bg-green-950/60 border-green-700/50 text-green-300 backdrop-blur-sm">
            <CircleCheckBig className="h-5 w-5 text-green-400" />
            <AlertTitle className="text-green-200">Login Successful</AlertTitle>
            <AlertDescription>Redirecting you now...</AlertDescription>
          </Alert>
        )}

        {login === false && (
          <Alert variant="destructive" className="max-w-md mt-6 bg-red-950/60 border-red-500/50 text-red-400 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-red-200" />
            <AlertTitle className="text-red-200">Login Failed</AlertTitle>
            <AlertDescription >Please enter both email and password.</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
}