import React from "react";
import { useProperties } from "@/hooks/api/properties/UseGetProperties";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { House, BedDouble, Bath, Ruler, MapPin, TrendingUp, Building2 } from "lucide-react";
import { BASE_URL } from "@/hooks/api/config";

const DEFAULT_PROPERTY_IMAGE = `${BASE_URL}/media/propertyimg/default.jpg`;

function StatusBadge({ status }) {
  const colors = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
    SOLD: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <Badge variant="outline" className={`${colors[status] || "bg-gray-100 text-gray-700"} font-semibold text-xs`}>
      {status}
    </Badge>
  );
}

export default function AgentDashboard() {
  const { isLoggedIn, user } = useAuth();
  const { data, isLoading, isError, error } = useProperties({ page: 1, enabled: isLoggedIn });

  const allProperties = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  const properties = allProperties.filter(
    (p) =>
      p.owner_id === user?.id ||
      p.agent_id === user?.id ||
      p.owner === user?.username ||
      p.agent === user?.username
  );

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "ACTIVE").length,
    underReview: properties.filter((p) => p.status === "UNDER_REVIEW").length,
    totalValue: properties.reduce((sum, p) => sum + Number(p.price || 0), 0),
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agent Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your assigned property listings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="w-5 h-5 text-blue-800" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg"><House className="w-5 h-5 text-green-700" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg"><TrendingUp className="w-5 h-5 text-amber-700" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-700" /></div>
              <div>
                <p className="text-lg font-bold text-gray-900 truncate">
                  ₱{(stats.totalValue / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Portfolio Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>Properties currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
          )}

          {isError && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
              Failed to load listings: {error?.message || "Unknown error"}
            </div>
          )}

          {!isLoading && properties.length === 0 && (
            <div className="text-center py-16">
              <House className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No listings assigned to you yet.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
                <div className="h-40 bg-gray-100 overflow-hidden">
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0].image}
                      alt={property.property_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={DEFAULT_PROPERTY_IMAGE}
                      alt="No image available"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {property.property_name || `Property #${property.id}`}
                    </h3>
                    <StatusBadge status={property.status} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{property.property_address}</span>
                  </div>
                  <p className="text-blue-900 font-bold text-sm">
                    ₱{property.price?.toLocaleString() ?? "N/A"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{property.num_bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.num_bathrooms}</span>
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{property.property_size} sqm</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
