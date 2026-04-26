import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProperties() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Properties</CardTitle>
        <CardDescription>Admin property management (Coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This feature is under development.</p>
      </CardContent>
    </Card>
  );
}
