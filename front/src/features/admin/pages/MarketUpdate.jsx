import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMarketUpdate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Update</CardTitle>
        <CardDescription>Trigger pricing engine updates (Coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This feature is under development.</p>
      </CardContent>
    </Card>
  );
}
