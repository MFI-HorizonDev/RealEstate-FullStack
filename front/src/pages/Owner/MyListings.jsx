import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/hooks/api/apiClient";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/hooks/api/config";
import {
  House, PlusCircle, Pencil, Trash2, Eye,
  MapPin, BedDouble, Bath, Ruler, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notifications";

const peso = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));
const IMAGE_PLACEHOLDER = `${BASE_URL}/media/propertyimg/default.jpg`;

function resolveImageSrc(imageValue) {
  if (typeof imageValue !== "string" || !imageValue.trim()) return IMAGE_PLACEHOLDER;
  if (imageValue.startsWith("http")) return imageValue;
  if (imageValue.startsWith("/")) return `${BASE_URL}${imageValue}`;
  return imageValue;
}

const STATUS_COLORS = {
  ACTIVE: "border-green-200 bg-green-100 text-green-800 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300",
  UNDER_REVIEW: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  REJECTED: "border-red-200 bg-red-100 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
  SOLD: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  INACTIVE: "border-border bg-muted text-muted-foreground",
};

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "UNDER_REVIEW", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SOLD", label: "Sold" },
];

export default function MyListings() {
  const { user, isLoggedIn } = useAuth();
  const { isAgent, isOwner, isAdmin } = useContextAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => apiGet("/properties/?page=1"),
    enabled: isLoggedIn,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/properties/${id}/delete/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      notify.success("Listing deleted successfully.");
    },
    onError: (error) => notify.error(error.message || "Failed to delete listing."),
  });

  const allProperties = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

  const myProperties = allProperties.filter((p) => {
    if (isAdmin) return true;
    return (
      p.owner_id === user?.id ||
      p.agent_id === user?.id ||
      p.owner === user?.username ||
      p.agent === user?.username
    );
  });

  const canManageListing = (listing) => isAdmin || listing.owner_id === user?.id;

  const filtered = myProperties.filter((p) => {
    const matchesTab = activeTab === "ALL" || p.status === activeTab;
    const matchesSearch = `${p.property_name} ${p.property_address}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: myProperties.length,
    active: myProperties.filter((p) => p.status === "ACTIVE").length,
    pending: myProperties.filter((p) => p.status === "UNDER_REVIEW").length,
    sold: myProperties.filter((p) => p.status === "SOLD").length,
  };

  const handleDelete = (property) => {
    if (!confirm(`Delete "${property.property_name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(property.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <p className="mt-1 text-muted-foreground">Manage all properties you've posted.</p>
        </div>
        {(isAgent || isOwner || isAdmin) && (
          <Link to="/properties/create">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> New Listing
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Pending", value: stats.pending },
          { label: "Sold", value: stats.sold },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pb-4 pt-5">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>All My Properties</CardTitle>
              <CardDescription>{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-muted">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs font-semibold">
                  {tab.label}
                  {tab.value !== "ALL" && (
                    <span className="ml-1.5 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {myProperties.filter((p) => p.status === tab.value).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          )}

          {isError && <p className="py-4 text-sm text-destructive">Failed to load listings.</p>}

          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <House className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">
                {myProperties.length === 0
                  ? "You haven't created any listings yet."
                  : "No listings match your current filter."}
              </p>
              {myProperties.length === 0 && (isAgent || isOwner || isAdmin) && (
                <Link to="/properties/create">
                  <Button className="mt-4">Create Your First Listing</Button>
                </Link>
              )}
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((property) => {
              const isLotListing = property.category === "LOT";

              return (
                <div
                  key={property.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row"
                >
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-auto sm:w-32">
                    {property.images?.length > 0 ? (
                      <img
                        src={resolveImageSrc(property.images?.[0]?.image)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = IMAGE_PLACEHOLDER;
                        }}
                        alt={property.property_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <House className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-start gap-2">
                      <h3 className="truncate text-base font-bold text-foreground">{property.property_name}</h3>
                      <Badge variant="outline" className={`${STATUS_COLORS[property.status] || STATUS_COLORS.INACTIVE} shrink-0 text-[10px] font-bold`}>
                        {property.status}
                      </Badge>
                      <Badge variant="outline" className="shrink-0 text-[10px] text-muted-foreground">
                        {isLotListing ? "LOT" : property.type}
                      </Badge>
                    </div>

                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{property.property_address}</span>
                      {property.property_municipality?.municipality_name && (
                        <span className="ml-1 font-semibold text-primary">
                          {property.property_municipality.municipality_name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-sm font-bold text-primary">{property.price ? peso(property.price) : "TBD"}</span>
                      {!isLotListing && property.num_bedrooms > 0 && (
                        <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{property.num_bedrooms} bed</span>
                      )}
                      {!isLotListing && property.num_bathrooms > 0 && (
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.num_bathrooms} bath</span>
                      )}
                      <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{property.property_size} sqm</span>
                    </div>

                    {property.status === "REJECTED" && (
                      <p className="mt-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
                        This listing was rejected. Edit and resubmit to request re-review.
                      </p>
                    )}
                    {property.status === "UNDER_REVIEW" && (
                      <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                        Under admin review. Pricing deviation was detected by the system.
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 justify-end gap-2 sm:flex-col">
                    <Link to={`/properties/${property.id}`}>
                      <Button size="sm" variant="outline" className="w-full gap-1.5 sm:w-auto">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                    {canManageListing(property) && (
                      <Link to={`/properties/${property.id}/edit`}>
                        <Button size="sm" className="w-full gap-1.5 sm:w-auto">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </Link>
                    )}
                    {canManageListing(property) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 sm:w-auto"
                        onClick={() => handleDelete(property)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
