import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TourBooking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Tour</CardTitle>
        <CardDescription>Book a property tour (Coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This feature is under development.</p>
      </CardContent>
    </Card>
  );
}
