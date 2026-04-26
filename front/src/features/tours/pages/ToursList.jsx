import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetTours } from "@/features/tours/hooks/useTours";
import { LoadingSpinner, EmptyState } from "@/shared/components/LoadingAndErrorStates";
import { Calendar, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * ToursList - Display scheduled tours
 */
export default function ToursList({ dashboard = false }) {
  const navigate = useNavigate();
  const { data: toursData, isLoading, error } = useGetTours();

  const tours = Array.isArray(toursData?.results)
    ? toursData.results
    : Array.isArray(toursData)
      ? toursData
      : [];

  if (isLoading) {
    return <LoadingSpinner message="Loading tours..." />;
  }

  if (tours.length === 0) {
    return (
      <EmptyState
        title="No Tours Found"
        description={dashboard ? "You haven't scheduled any tours yet." : "No tours available."}
        action={
          dashboard ? (
            <Button onClick={() => navigate("/dashboard/tours/book")} className="bg-blue-600">
              Schedule Tour
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {dashboard ? "My Tours" : "Available Tours"}
        </h1>
        <p className="text-gray-600 mt-1">Total: {tours.length} tours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.map((tour) => (
          <Card key={tour.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2">{tour.property?.property_name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {tour.property?.property_municipality?.municipality_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{new Date(tour.scheduled_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>{tour.agent?.first_name} {tour.agent?.last_name}</span>
                </div>
              </div>

              <div>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {tour.status}
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/dashboard/tours/${tour.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
