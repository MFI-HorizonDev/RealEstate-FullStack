import React from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetPropertyById } from "@/features/properties/hooks/useProperties";
import { LoadingSpinner, EmptyState } from "@/shared/components/LoadingAndErrorStates";
import { MapPin, Bed, Bath, Maximize2, Home } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * PropertyDetails - Display detailed property information
 */
export default function PropertyDetails({ dashboard = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading, error } = useGetPropertyById(id);

  if (isLoading) {
    return <LoadingSpinner message="Loading property details..." />;
  }

  if (!property) {
    return (
      <EmptyState
        icon={Home}
        title="Property Not Found"
        description="The property you're looking for doesn't exist."
        action={
          <Button
            onClick={() => navigate(dashboard ? "/dashboard/properties" : "/properties")}
          >
            View Properties
          </Button>
        }
      />
    );
  }

  const imageUrl =
    property?.images?.[0]?.image ||
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/media/propertyimg/default.jpg`;

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={property.property_name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Price */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{property.property_name}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-lg mt-2">
                <MapPin size={18} />
                {property.property_municipality?.municipality_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                ₱{property.price?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {property.type === "RENT" ? "per month" : "total price"}
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Bedrooms</label>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Bed size={20} />
                  {property.num_bedrooms}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Bathrooms</label>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Bath size={20} />
                  {property.num_bathrooms}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Land Size</label>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Maximize2 size={20} />
                  {property.property_size} sqm
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Building Size</label>
                <p className="text-2xl font-bold mt-1">{property.building_size} sqm</p>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {property.property_description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{property.property_description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Agent */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.agent ? (
                <>
                  <div>
                    <p className="font-semibold">
                      {property.agent?.first_name} {property.agent?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{property.agent?.email}</p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Contact Agent
                  </Button>
                </>
              ) : (
                <p className="text-gray-600">No agent assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {dashboard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Edit Property
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete Property
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tour Booking */}
          {property.is_available_for_tour && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Book a Tour
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
