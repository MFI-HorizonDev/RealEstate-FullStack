import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DealDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Details</CardTitle>
        <CardDescription>View sale transaction details (Coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This feature is under development.</p>
      </CardContent>
    </Card>
  );
}
