import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";

/**
 * PropertyFilter - Reusable property filter component
 * Used in property listings and search pages
 */
export const PropertyFilter = ({
  onFilterChange,
  municipalities = [],
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    municipality: "",
    type: "",
    category: "",
    minPrice: 0,
    maxPrice: 50000000,
    minBeds: 0,
    minBaths: 0,
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      municipality: "",
      type: "",
      category: "",
      minPrice: 0,
      maxPrice: 50000000,
      minBeds: 0,
      minBaths: 0,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter size={18} />
        Filters
      </Button>

      {isOpen && (
        <Card className="absolute top-12 left-0 w-80 z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Filter Properties</CardTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-100 p-1 rounded"
            >
              <X size={20} />
            </button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Property name or address"
                value={filters.search}
                onChange={(e) => handleChange("search", e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Municipality */}
            <div>
              <label className="text-sm font-medium">Municipality</label>
              <Select
                value={filters.municipality}
                onValueChange={(value) =>
                  handleChange("municipality", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {municipalities.map((mun) => (
                    <SelectItem key={mun.id} value={mun.id.toString()}>
                      {mun.municipality_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="SALE">For Sale</SelectItem>
                  <SelectItem value="RENT">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="HOUSE_AND_LOT">House and Lot</SelectItem>
                  <SelectItem value="LOT">Lot</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="CONDO">Condo</SelectItem>
                  <SelectItem value="COMMERCIAL_SPACE">
                    Commercial Space
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium">
                Price Range: ₱{filters.minPrice.toLocaleString()} - ₱
                {filters.maxPrice.toLocaleString()}
              </label>
              <div className="mt-2 space-y-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleChange("minPrice", parseInt(e.target.value) || 0)
                  }
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleChange(
                      "maxPrice",
                      parseInt(e.target.value) || 50000000
                    )
                  }
                  className="text-sm"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-sm font-medium">
                Min Bedrooms: {filters.minBeds}
              </label>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[filters.minBeds]}
                onValueChange={(value) => handleChange("minBeds", value[0])}
                className="mt-1"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="text-sm font-medium">
                Min Bathrooms: {filters.minBaths}
              </label>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[filters.minBaths]}
                onValueChange={(value) => handleChange("minBaths", value[0])}
                className="mt-1"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3">
              <Button
                onClick={handleApply}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyFilter;
