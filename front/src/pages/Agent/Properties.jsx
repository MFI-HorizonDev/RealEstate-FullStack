import React from "react";
import { Link } from "react-router";
import { useProperties } from "@/services/api/useProperties";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { House, BedDouble, Bath, Ruler, MapPin } from "lucide-react";

const peso = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));

function StatusBadge({ status }) {
  const colors = { ACTIVE: "bg-green-100 text-green-800 border-green-200", UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-200", REJECTED: "bg-red-100 text-red-800 border-red-200", SOLD: "bg-blue-100 text-blue-800 border-blue-200" };
  return <Badge variant="outline" className={`${colors[status] || "bg-gray-100 text-gray-700"} text-xs font-semibold`}>{status}</Badge>;
}

export default function AgentProperties() {
  const { isLoggedIn } = useAuth();
  const { data, isLoading, isError, error } = useProperties({ page: 1, enabled: isLoggedIn });
  const properties = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <p className="text-gray-500 mt-1">All properties assigned to you as agent.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Listings</CardTitle>
          <CardDescription>{properties.length} properties found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}
          {isError && <p className="text-red-600 text-sm">Failed to load: {error?.message}</p>}
          {!isLoading && properties.length === 0 && (
            <div className="text-center py-16"><House className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No properties assigned to you yet.</p></div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => (
              <Link to={`/properties/${p.id}`} key={p.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    {p.images?.length > 0
                      ? <img src={p.images[0].image} alt={p.property_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><House className="w-8 h-8 text-gray-300" /></div>}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.property_name || `Property #${p.id}`}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" /><span className="truncate">{p.property_address}</span></div>
                    <p className="font-bold text-blue-900 text-sm">{p.price ? peso(p.price) : "N/A"}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{p.num_bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.num_bathrooms}</span>
                      <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{p.property_size} sqm</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
