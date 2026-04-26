import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>View and manage user accounts (Coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This feature is under development.</p>
      </CardContent>
    </Card>
  );
}
