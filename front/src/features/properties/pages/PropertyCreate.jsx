import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProperty } from "@/features/properties/hooks/useProperties";
import { useGetMunicipalities } from "@/shared/hooks/useMunicipalities";

/**
 * PropertyCreate - Create new property form
 */
export default function PropertyCreate() {
  const navigate = useNavigate();
  const { mutate: createProperty, isPending } = useCreateProperty();
  const { data: municipalities = [] } = useGetMunicipalities();

  const [formData, setFormData] = useState({
    property_name: "",
    property_description: "",
    property_address: "",
    property_municipality: "",
    category: "HOUSE_AND_LOT",
    property_size: "",
    building_size: "",
    num_bedrooms: "",
    num_bathrooms: "",
    type: "SALE",
    price: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProperty(formData, {
      onSuccess: () => {
        navigate("/dashboard/properties");
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Property</h1>
        <p className="text-gray-600 mt-1">Add a new property to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Enter the details of your property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name</Label>
                <Input
                  id="property_name"
                  value={formData.property_name}
                  onChange={(e) => handleChange("property_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_address">Address</Label>
                <Input
                  id="property_address"
                  value={formData.property_address}
                  onChange={(e) => handleChange("property_address", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_municipality">Municipality</Label>
                  <Select
                    value={formData.property_municipality}
                    onValueChange={(value) =>
                      handleChange("property_municipality", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((mun) => (
                        <SelectItem key={mun.id} value={mun.id.toString()}>
                          {mun.municipality_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOUSE_AND_LOT">House and Lot</SelectItem>
                      <SelectItem value="LOT">Lot</SelectItem>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                      <SelectItem value="CONDO">Condo</SelectItem>
                      <SelectItem value="COMMERCIAL_SPACE">Commercial Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Property Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_size">Land Size (sqm)</Label>
                  <Input
                    id="property_size"
                    type="number"
                    value={formData.property_size}
                    onChange={(e) => handleChange("property_size", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building_size">Building Size (sqm)</Label>
                  <Input
                    id="building_size"
                    type="number"
                    value={formData.building_size}
                    onChange={(e) => handleChange("building_size", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="num_bedrooms">Bedrooms</Label>
                  <Input
                    id="num_bedrooms"
                    type="number"
                    value={formData.num_bedrooms}
                    onChange={(e) => handleChange("num_bedrooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_bathrooms">Bathrooms</Label>
                  <Input
                    id="num_bathrooms"
                    type="number"
                    value={formData.num_bathrooms}
                    onChange={(e) => handleChange("num_bathrooms", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Listing Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Listing Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Listing Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALE">For Sale</SelectItem>
                      <SelectItem value="RENT">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="property_description">Description</Label>
              <textarea
                id="property_description"
                value={formData.property_description}
                onChange={(e) => handleChange("property_description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? "Creating..." : "Create Property"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/properties")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
