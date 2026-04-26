import React, { useState, useEffect } from "react";
import { useProperties } from "@/hooks/api/properties/UseGetProperties";
import { useMunicipalities } from "@/hooks/api/municipalities/UseGetMunicipalities";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { BASE_URL } from "@/hooks/api/config";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LISTING_TYPES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];
const IMAGE_PLACEHOLDER = `${BASE_URL}/media/propertyimg/default.jpg`;

function resolveImageSrc(imageValue) {
  if (typeof imageValue !== "string" || !imageValue.trim()) return IMAGE_PLACEHOLDER;
  if (imageValue.startsWith("http")) return imageValue;
  if (imageValue.startsWith("/")) return `${BASE_URL}${imageValue}`;
  return imageValue;
}

function formatPropertyPrice(property) {
  if (!property?.price) return "TBD";
  if (property.type === "RENT") return `₱${Number(property.price).toLocaleString()}/month`;
  return `₱${(property.price / 1000000).toFixed(1)}M`;
}

export default function AllProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const { isAgent, isOwner, isAdmin, isAuthLoading } = useContextAuth();
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state — initialized from URL params
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 50000000
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    searchParams.get("municipality") || "any"
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || "all"
  );

  const { data, isLoading, isError, error } = useProperties({ 
    page: currentPage, 
    enabled: true,
    status: (isOwner || isAdmin || isAgent) ? activeTab : "ACTIVE"
  });
  const { data: municipalities = [] } = useMunicipalities({ enabled: true });

  const properties = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
  const pageSize = 10;
  const totalCount = typeof data?.count === "number" ? data.count : properties.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrevPage = Boolean(data?.previous) && currentPage > 1;
  const canNextPage = Boolean(data?.next) && currentPage < totalPages;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Client-side filtering — matches actual API field names
  const filtered = properties.filter((p) => {
    // Price filter
    if (maxPrice < 50000000 && Number(p.price || 0) > maxPrice) return false;

    // Municipality filter — property_municipality is a nested object { id, ... }
    if (selectedMunicipality && selectedMunicipality !== "any") {
      const munId = String(p.property_municipality?.id ?? "");
      if (munId !== selectedMunicipality) return false;
    }

    // Listing type filter (SALE / RENT)
    if (selectedType && selectedType !== "all") {
      if ((p.type || "") !== selectedType) return false;
    }

    return true;
  });

  const hasActiveFilters =
    maxPrice < 50000000 ||
    selectedMunicipality !== "any" ||
    selectedType !== "all";

  const applyFilters = () => {
    const params = {};
    if (maxPrice < 50000000) params.maxPrice = maxPrice;
    if (selectedMunicipality !== "any") params.municipality = selectedMunicipality;
    if (selectedType !== "all") params.type = selectedType;
    setSearchParams(params);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setMaxPrice(50000000);
    setSelectedMunicipality("any");
    setSelectedType("all");
    setSearchParams({});
    setCurrentPage(1);
  };

  // Carousel image index
  const [imgIndexes, setImgIndexes] = useState({});
  const nextImg = (e, propId, maxLen) => {
    e.preventDefault();
    setImgIndexes(prev => ({ ...prev, [propId]: ((prev[propId] || 0) + 1) % maxLen }));
  };
  const prevImg = (e, propId, maxLen) => {
    e.preventDefault();
    setImgIndexes(prev => ({ ...prev, [propId]: ((prev[propId] || 0) - 1 + maxLen) % maxLen }));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground text-lg">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Max Price */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Max Price
                  </Label>
                  <span className="text-xs font-bold text-primary">
                    {maxPrice >= 50000000 ? "Any" : `₱${(maxPrice / 1000000).toFixed(1)}M`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="50000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₱1M</span>
                  <span>₱50M+</span>
                </div>
              </div>

              {/* Location / Municipality */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Location
                </Label>
                <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                  <SelectTrigger className="h-10 border-border bg-background text-sm">
                    <SelectValue placeholder="Any Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.municipality_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Listing Type */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Listing Type
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-10 border-border bg-background text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={applyFilters}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Explore Properties</h1>
              <p className="text-muted-foreground text-sm">
                {isLoading
                  ? "Loading properties..."
                  : `Showing ${filtered.length}${filtered.length !== properties.length ? ` of ${properties.length}` : ""} properties`}
                {hasActiveFilters && !isLoading && (
                  <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                    Filtered
                  </span>
                )}
              </p>
            </div>
            
            {!isAuthLoading && isAdmin && (
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-muted p-1 rounded-lg">
                  <TabsList className="bg-transparent h-9">
                    <TabsTrigger value="ACTIVE" className="px-4 text-xs font-bold">Active</TabsTrigger>
                    <TabsTrigger value="UNDER_REVIEW" className="px-4 text-xs font-bold">Pending</TabsTrigger>
                    <TabsTrigger value="SOLD" className="px-4 text-xs font-bold">Sold</TabsTrigger>
                    <TabsTrigger value="REJECTED" className="px-4 text-xs font-bold">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
                {(isAgent || isOwner || isAdmin) && (
                  <Link to="/properties/create">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg transition-transform active:scale-95 text-xs">
                      New Listing
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>


          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          )}

          {isError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
              Failed to load properties: {error?.message}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
              <Search className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No properties match your filters</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search criteria.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary font-semibold hover:underline text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((property) => {
              const imgIdx = imgIndexes[property.id] || 0;
              const hasImages =
                Array.isArray(property.images) &&
                property.images.some((img) => typeof img?.image === "string" && img.image.trim());
              const listingLabel = LISTING_TYPES.find(t => t.value === property.type)?.label || property.type;

              return (
                <Link to={`/properties/${property.id}`} key={property.id} className="block group">
                  <Card className="overflow-hidden border border-border hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card">
                    <div className="relative h-60 bg-muted overflow-hidden">
                      {hasImages ? (
                        <img
                          src={resolveImageSrc(property.images?.[imgIdx]?.image)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = IMAGE_PLACEHOLDER;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={property.property_name}
                        />
                      ) : (
                        <img
                          src={IMAGE_PLACEHOLDER}
                          alt="No image available"
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Status badge */}
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase backdrop-blur-sm text-white ${
                          property.status === 'ACTIVE' ? 'bg-green-600/90' :
                          property.status === 'REJECTED' ? 'bg-red-600/90' : 'bg-amber-600/90'
                        }`}>
                          {property.status}
                        </span>
                        {property.type && (
                          <span className="bg-blue-950/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                            {listingLabel}
                          </span>
                        )}
                      </div>

                      {/* Image carousel buttons */}
                      {hasImages && property.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImg(e, property.id, property.images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 hover:bg-background text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => nextImg(e, property.id, property.images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 hover:bg-background text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    <CardContent className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-foreground text-lg mb-1 truncate group-hover:text-primary transition-colors">
                        {property.property_name || `Property ${property.id}`}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-1 truncate">
                        {property.property_address || "Address not provided"}
                      </p>
                      {property.property_municipality?.municipality_name && (
                        <p className="text-primary text-[10px] font-bold tracking-widest uppercase mb-3">
                          📍 {property.property_municipality.municipality_name}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Asking Price</p>
                          <p className="text-xl font-bold text-primary">
                            {formatPropertyPrice(property)}
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-muted-foreground font-medium">
                          {property.num_bedrooms > 0 && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground/60">Beds</span>
                              <span>{property.num_bedrooms}</span>
                            </div>
                          )}
                          {property.num_bathrooms > 0 && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground/60">Baths</span>
                              <span>{property.num_bathrooms}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalCount} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!canNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

