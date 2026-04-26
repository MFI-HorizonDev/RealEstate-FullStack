import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * PropertyCard - Reusable property listing card
 * Used in property listings, search results, and dashboards
 */
export const PropertyCard = ({ property, onFavorite, isFavorited }) => {
  const navigate = useNavigate();
  const imageUrl =
    property?.images?.[0]?.image ||
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/media/propertyimg/default.jpg`;

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    SOLD: "bg-red-100 text-red-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-gray-100 text-gray-800",
    INACTIVE: "bg-gray-100 text-gray-800",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={property.property_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
        <Badge
          className={`absolute top-3 right-3 ${
            statusColors[property.status] || statusColors.ACTIVE
          }`}
        >
          {property.status}
        </Badge>
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(property.id);
            }}
            className="absolute top-3 left-3 bg-white rounded-full p-2 hover:bg-gray-100"
          >
            <Heart
              size={20}
              className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-lg">
              {property.property_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin size={16} />
              {property.property_municipality?.municipality_name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="mb-3">
          <div className="text-2xl font-bold text-blue-600">
            ₱{property.price?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {property.type === "RENT" ? "per month" : "total price"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Bed size={16} className="text-gray-400" />
            <span>{property.num_bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} className="text-gray-400" />
            <span>{property.num_bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 size={16} className="text-gray-400" />
            <span>{property.property_size} sqm</span>
          </div>
        </div>

        <div className="mt-2">
          <Badge variant="outline">{property.category}</Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          View Details
        </Button>
        {property.is_available_for_tour && (
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate(`/tours/${property.id}`)}
          >
            Book Tour
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
