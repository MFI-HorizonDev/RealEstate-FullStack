import React, { useState, useEffect } from "react";
import { useProperties } from "@/services/api/useProperties";
import { useMunicipalities } from "@/services/api/useMunicipalities";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent } from "@/components/ui/card";

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
  { value: "LEASE", label: "For Lease" },
  { value: "FORECLOSURE", label: "Foreclosure" },
];

export default function AllProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("ACTIVE");

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

  const isOwner = user?.groups?.includes("Owner");
  const isAdmin = user?.groups?.includes("Admin") || user?.is_superuser || user?.groups?.includes("SuperAdmin") || user?.groups?.includes("Super Admin");

  const { data, isLoading, isError, error } = useProperties({ 
    page: 1, 
    enabled: true,
    status: (isOwner || isAdmin) ? activeTab : "ACTIVE"
  });
  const { data: municipalities = [] } = useMunicipalities({ enabled: true });

  const properties = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];

  // Client-side filtering — matches actual API field names
  const filtered = properties.filter((p) => {
    // Price filter
    if (maxPrice < 50000000 && Number(p.price || 0) > maxPrice) return false;

    // Municipality filter — property_municipality is a nested object { id, ... }
    if (selectedMunicipality && selectedMunicipality !== "any") {
      const munId = String(p.property_municipality?.id ?? "");
      if (munId !== selectedMunicipality) return false;
    }

    // Listing type filter (SALE / RENT / LEASE / FORECLOSURE)
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
  };

  const clearFilters = () => {
    setMaxPrice(50000000);
    setSelectedMunicipality("any");
    setSelectedType("all");
    setSearchParams({});
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-800" />
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Max Price */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Max Price
                  </Label>
                  <span className="text-xs font-bold text-blue-800">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>₱1M</span>
                  <span>₱50M+</span>
                </div>
              </div>

              {/* Location / Municipality */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Location
                </Label>
                <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                  <SelectTrigger className="h-10 border-gray-200 text-sm">
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
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Listing Type
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-10 border-gray-200 text-sm">
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
                className="w-full bg-blue-800 hover:bg-blue-900 text-white flex items-center justify-center gap-2"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Explore Properties</h1>
              <p className="text-gray-500 text-sm">
                {isLoading
                  ? "Loading properties..."
                  : `Showing ${filtered.length}${filtered.length !== properties.length ? ` of ${properties.length}` : ""} properties`}
                {hasActiveFilters && !isLoading && (
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    Filtered
                  </span>
                )}
              </p>
            </div>
            
            {(isOwner || isAdmin) && (
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-gray-100 p-1 rounded-lg">
                  <TabsList className="bg-transparent h-9">
                    <TabsTrigger value="ACTIVE" className="px-4 text-xs font-bold">Active</TabsTrigger>
                    <TabsTrigger value="UNDER_REVIEW" className="px-4 text-xs font-bold">Pending</TabsTrigger>
                    <TabsTrigger value="REJECTED" className="px-4 text-xs font-bold">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Link to="/properties/create">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg transition-transform active:scale-95 text-xs">
                    New Listing
                  </Button>
                </Link>
              </div>
            )}
          </div>


          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800" />
            </div>
          )}

          {isError && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
              Failed to load properties: {error?.message}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No properties match your filters</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-700 font-semibold hover:underline text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((property) => {
              const imgIdx = imgIndexes[property.id] || 0;
              const hasImages = property.images && property.images.length > 0;
              const listingLabel = LISTING_TYPES.find(t => t.value === property.type)?.label || property.type;

              return (
                <Link to={`/properties/${property.id}`} key={property.id} className="block group">
                  <Card className="overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white">
                    <div className="relative h-60 bg-gray-100 overflow-hidden">
                      {hasImages ? (
                        <img
                          src={property.images[imgIdx].image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={property.property_name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 font-medium">No Image</span>
                        </div>
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
                          <span className="bg-blue-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                            {listingLabel}
                          </span>
                        )}
                      </div>

                      {/* Image carousel buttons */}
                      {hasImages && property.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImg(e, property.id, property.images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => nextImg(e, property.id, property.images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    <CardContent className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-800 transition-colors">
                        {property.property_name || `Property ${property.id}`}
                      </h3>
                      <p className="text-gray-500 text-sm mb-1 truncate">
                        {property.property_address || "Address not provided"}
                      </p>
                      {property.property_municipality?.municipality_name && (
                        <p className="text-blue-700 text-[10px] font-bold tracking-widest uppercase mb-3">
                          📍 {property.property_municipality.municipality_name}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Asking Price</p>
                          <p className="text-xl font-bold text-blue-900">
                            {property.price ? `₱${(property.price / 1000000).toFixed(1)}M` : "TBD"}
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-gray-600 font-medium">
                          {property.num_bedrooms > 0 && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-400">Beds</span>
                              <span>{property.num_bedrooms}</span>
                            </div>
                          )}
                          {property.num_bathrooms > 0 && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-400">Baths</span>
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
        </div>
      </div>
    </div>
  );
}

