import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRoleRequests() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Requests</CardTitle>
        <CardDescription>Review role upgrade requests (Coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This feature is under development.</p>
      </CardContent>
    </Card>
  );
}
