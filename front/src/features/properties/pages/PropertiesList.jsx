import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useGetProperties } from "@/features/properties/hooks/useProperties";
import { useGetMunicipalities } from "@/shared/hooks/useMunicipalities";
import { PropertyFilter } from "@/shared/components/PropertyFilter";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
} from "@/shared/components/LoadingAndErrorStates";

/**
 * PropertiesList - Display properties in table or grid format
 * Used by owners, agents, and admins
 */
export default function PropertiesList({ dashboard = false }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  // Build query params
  const queryParams = {
    page,
    search: searchText,
    ...filters,
  };

  // Fetch data
  const { data: propertiesData, isLoading, error, refetch } = useGetProperties(
    queryParams
  );
  const { data: municipalities = [] } = useGetMunicipalities();

  const properties = Array.isArray(propertiesData?.results)
    ? propertiesData.results
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];

  const totalPages = Math.ceil((propertiesData?.count || 0) / 10);

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    SOLD: "bg-red-100 text-red-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-gray-100 text-gray-800",
    INACTIVE: "bg-gray-100 text-gray-800",
  };

  const typeColors = {
    SALE: "bg-blue-100 text-blue-800",
    RENT: "bg-purple-100 text-purple-800",
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={() => refetch()} />;
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        title="No Properties Found"
        description={
          dashboard
            ? "You haven't created any properties yet."
            : "No properties match your search criteria."
        }
        action={
          dashboard ? (
            <Button
              onClick={() => navigate("/dashboard/properties/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Property
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {dashboard ? "My Properties" : "All Properties"}
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {propertiesData?.count || properties.length} properties
          </p>
        </div>
        {dashboard && (
          <Button
            onClick={() => navigate("/dashboard/properties/create")}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            New Property
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Search by name or address..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-64"
            />
            <PropertyFilter
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setPage(1);
              }}
              municipalities={municipalities}
            />
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            Showing {properties.length} of {propertiesData?.count || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Beds/Baths</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {property.property_name}
                    </TableCell>
                    <TableCell>
                      {property.property_municipality?.municipality_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColors[property.type]}>
                        {property.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[property.status] || statusColors.INACTIVE
                        }
                      >
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ₱{property.price?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {property.num_bedrooms}/{property.num_bathrooms}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              dashboard
                                ? `/dashboard/properties/${property.id}`
                                : `/properties/${property.id}`
                            )
                          }
                        >
                          <Eye size={16} />
                        </Button>
                        {dashboard && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(
                                  `/dashboard/properties/${property.id}/edit`
                                )
                              }
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                // TODO: Implement delete with confirmation
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
