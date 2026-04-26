import React, { useState } from "react";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { apiPost } from "@/hooks/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function MarketUpdate() {
  const { isLoggedIn } = useAuth();
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleTrigger = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await apiPost("/admin/trigger-market-update/", {});
      setStatus("success");
      setMessage(res?.detail || "Market buffers updated successfully.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to trigger update.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Buffer Update</h1>
        <p className="text-gray-500 mt-1">Manually trigger the pricing engine recalculation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-800" /> Trigger Market Update</CardTitle>
          <CardDescription>
            This runs the same task that executes automatically at midnight. It recalculates the 30-day average
            sale price per sqm for every municipality and updates the Redis cache used by the Pricing Engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-2">
            <p className="font-semibold">When to use this:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>After creating a new Sale record to see its effect on valuations</li>
              <li>During a demo to show the dynamic pricing engine in action</li>
              <li>After bulk-importing sale data</li>
            </ul>
          </div>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Update Complete</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Update Failed</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleTrigger}
            disabled={status === "loading"}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white h-12 text-base font-semibold gap-2"
          >
            <Zap className="w-5 h-5" />
            {status === "loading" ? "Running..." : "Run Market Buffer Update Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
