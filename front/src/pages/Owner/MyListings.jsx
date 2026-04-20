import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/services/api/apiClient";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  House, PlusCircle, Pencil, Trash2, Eye,
  MapPin, BedDouble, Bath, Ruler, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const peso = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));

const STATUS_COLORS = {
  ACTIVE:       "bg-green-100 text-green-800 border-green-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
  REJECTED:     "bg-red-100 text-red-800 border-red-200",
  SOLD:         "bg-blue-100 text-blue-800 border-blue-200",
  INACTIVE:     "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_TABS = [
  { value: "ALL",          label: "All" },
  { value: "ACTIVE",       label: "Active" },
  { value: "UNDER_REVIEW", label: "Pending" },
  { value: "REJECTED",     label: "Rejected" },
  { value: "SOLD",         label: "Sold" },
];

export default function MyListings() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  // Fetch all properties — backend filters by ownership server-side for non-admins
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
      toast.success("Listing deleted.");
    },
    onError: () => toast.error("Failed to delete listing."),
  });

  const allProperties = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

  // Filter to only this owner's properties using owner_id
  const myProperties = allProperties.filter(
    (p) => p.owner_id === user?.id || p.owner === user?.username
  );

  // Tab + search filter
  const filtered = myProperties.filter((p) => {
    const matchesTab = activeTab === "ALL" || p.status === activeTab;
    const matchesSearch = `${p.property_name} ${p.property_address}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total:   myProperties.length,
    active:  myProperties.filter((p) => p.status === "ACTIVE").length,
    pending: myProperties.filter((p) => p.status === "UNDER_REVIEW").length,
    sold:    myProperties.filter((p) => p.status === "SOLD").length,
  };

  const handleDelete = (p) => {
    if (!confirm(`Delete "${p.property_name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(p.id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-1">Manage all properties you've posted.</p>
        </div>
        <Link to="/properties/create">
          <Button className="bg-blue-800 hover:bg-blue-900 text-white gap-2">
            <PlusCircle className="w-4 h-4" /> New Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",        value: stats.total,   color: "bg-blue-50 text-blue-800" },
          { label: "Active",       value: stats.active,  color: "bg-green-50 text-green-800" },
          { label: "Pending",      value: stats.pending, color: "bg-amber-50 text-amber-800" },
          { label: "Sold",         value: stats.sold,    color: "bg-blue-50 text-blue-800" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All My Properties</CardTitle>
              <CardDescription>{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-gray-100">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs font-semibold">
                  {t.label}
                  {t.value !== "ALL" && (
                    <span className="ml-1.5 bg-white/70 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                      {myProperties.filter((p) => p.status === t.value).length}
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

          {isError && (
            <p className="text-red-600 text-sm py-4">Failed to load listings.</p>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <House className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {myProperties.length === 0
                  ? "You haven't created any listings yet."
                  : "No listings match your current filter."}
              </p>
              {myProperties.length === 0 && (
                <Link to="/properties/create">
                  <Button className="mt-4 bg-blue-800 text-white">Create Your First Listing</Button>
                </Link>
              )}
            </div>
          )}

          {/* Property cards */}
          <div className="space-y-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-32 h-24 sm:h-auto rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {p.images?.length > 0 ? (
                    <img src={p.images[0].image} alt={p.property_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <House className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base truncate">{p.property_name}</h3>
                    <Badge variant="outline" className={`${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-700"} text-[10px] font-bold shrink-0`}>
                      {p.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-gray-600 shrink-0">{p.type}</Badge>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.property_address}</span>
                    {p.property_municipality?.municipality_name && (
                      <span className="text-blue-700 font-semibold ml-1">· {p.property_municipality.municipality_name}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="font-bold text-blue-900 text-sm">{p.price ? peso(p.price) : "TBD"}</span>
                    {p.num_bedrooms > 0 && (
                      <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{p.num_bedrooms} bed</span>
                    )}
                    {p.num_bathrooms > 0 && (
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.num_bathrooms} bath</span>
                    )}
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{p.property_size} sqm</span>
                  </div>

                  {p.status === "REJECTED" && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                      This listing was rejected. Edit and resubmit to request re-review.
                    </p>
                  )}
                  {p.status === "UNDER_REVIEW" && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                      Under admin review — pricing deviation detected by the system.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                  <Link to={`/properties/${p.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 w-full sm:w-auto border-gray-200 text-gray-700 hover:text-blue-800 hover:border-blue-200">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </Link>
                  <Link to={`/properties/${p.id}/edit`}>
                    <Button size="sm" className="gap-1.5 w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-white">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(p)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
