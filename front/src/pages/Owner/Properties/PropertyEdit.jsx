import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useProperty, useUpdateProperty } from "@/hooks/api/properties/UseProperties";
import { useValuationPreviewPOST } from "@/hooks/api/properties/UseValuationPreview";
import { useMunicipalities } from "@/hooks/api/municipalities/UseGetMunicipalities";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import SuccessModal from "@/components/ui/SuccessModal";
import PropertyImageManager from "@/components/PropertyImageManager";
import { canEditProperty } from "@/features/properties/api/permissions";
import { notify } from "@/lib/notifications";
import {
  Building2, MapPin, Ruler, AlertCircle, CheckCircle2,
  ImagePlus, BedDouble, Bath, Layers, ArrowLeft,
} from "lucide-react";
import CmaRecommendationCard from "@/components/properties/CmaRecommendationCard";

const LISTING_TYPES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

const PROPERTY_CATEGORIES = [
  { value: "HOUSE_AND_LOT", label: "House and Lot" },
  { value: "LOT", label: "Lot" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDO", label: "Condo" },
  { value: "COMMERCIAL_SPACE", label: "Commercial Space" },
];

export default function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: property, isLoading: loadingProp } = useProperty(id);
  const { data: municipalities = [] } = useMunicipalities();
  const { mutateAsync: updateProperty, isPending } = useUpdateProperty(id);
  const { mutate: getValuation, data: valuation, isPending: isLoadingValuation } = useValuationPreviewPOST();

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!property) return;
    setFormData({
      property_name: property.property_name || "",
      property_description: property.property_description || "",
      property_address: property.property_address || "",
      property_municipality: String(property.property_municipality?.id || ""),
      property_size: String(property.property_size || ""),
      category: property.category || "HOUSE_AND_LOT",
      condition: property.condition || "GOOD",
      location_quality: property.location_quality || "SUBURBAN",
      building_size: String(property.building_size || 0),
      price: property.price === null || property.price === undefined ? "" : String(property.price),
      type: property.type || "SALE",
      num_bedrooms: String(property.num_bedrooms ?? 0),
      num_bathrooms: String(property.num_bathrooms ?? 1),
      is_available_for_tour: property.is_available_for_tour ?? false,
    });
  }, [property]);

  const PROPERTY_CONDITIONS = [
    { value: "NEW", label: "New / Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "POOR", label: "Poor / Needs Renovation" },
  ];

  const LOCATION_QUALITIES = [
    { value: "PREMIUM", label: "Premium (CBD / Elite)" },
    { value: "URBAN", label: "Urban (Central)" },
    { value: "SUBURBAN", label: "Suburban" },
    { value: "RURAL", label: "Rural" },
  ];

  // Auto-refresh valuation preview
  useEffect(() => {
    if (!formData?.property_municipality || !formData?.property_size || formData?.type === "RENT") return;
    
    const timer = setTimeout(() => {
      getValuation({
        property_municipality: formData.property_municipality,
        property_size: formData.property_size,
        category: formData.category,
        condition: formData.condition,
        location_quality: formData.location_quality,
        building_size: formData.building_size || 0,
        type: formData.type
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [
    formData?.property_municipality,
    formData?.property_size,
    formData?.category,
    formData?.condition,
    formData?.location_quality,
    formData?.building_size,
    formData?.type
  ]);

  const canEdit = property ? canEditProperty({ user }, property) : false;
  const isLotListing = formData?.category === "LOT";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.property_municipality) {
      setError("Please select a municipality.");
      return;
    }

    if (formData.type === "RENT" && (formData.price === "" || Number(formData.price) <= 0)) {
      setError("For Rent listings require a monthly price greater than 0.");
      return;
    }

    try {
      const updatePayload = {
        ...formData,
        property_municipality: parseInt(formData.property_municipality, 10),
        property_size: parseFloat(formData.property_size),
        building_size: isLotListing ? 0 : (parseFloat(formData.building_size) || 0),
        num_bedrooms: isLotListing ? 0 : (parseInt(formData.num_bedrooms, 10) || 0),
        num_bathrooms: isLotListing ? 0 : (parseInt(formData.num_bathrooms, 10) || 1),
        ...(formData.type === "RENT"
          ? { price: parseFloat(formData.price) }
          : formData.price !== ""
            ? { price: parseFloat(formData.price) || 0 }
            : {}),
      };
      await updateProperty(updatePayload);

      setSuccess(true);
    } catch (err) {
      notify.apiError(err, "Failed to update listing.");
      setError(err.message || "Failed to update listing.");
    }
  };

  if (loadingProp || !formData) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-xl font-bold text-foreground">Access Denied</h2>
        <p className="mb-6 text-muted-foreground">Only the listing owner can edit this property.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/properties/${id}`)} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Listing
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Edit Listing</h1>
        <p className="text-muted-foreground">Update the details of <span className="font-semibold text-primary">{property.property_name}</span>.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 border-green-500/20 bg-green-500/10 text-green-800 dark:text-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">Saved!</AlertTitle>
          <AlertDescription>Listing updated successfully.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name *</Label>
                <Input id="property_name" name="property_name" value={formData.property_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Listing Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setField("type", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_description">Description *</Label>
              <Textarea id="property_description" name="property_description" className="min-h-[140px]" value={formData.property_description} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property_size" className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" /> {isLotListing ? "Lot Area (sqm) *" : "Size (sqm) *"}
                </Label>
                <Input id="property_size" name="property_size" type="number" min="1" value={formData.property_size} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Asking Price (PHP)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  required={formData.type === "RENT"}
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
              <input
                type="checkbox"
                id="is_available_for_tour"
                name="is_available_for_tour"
                checked={formData.is_available_for_tour}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <Label htmlFor="is_available_for_tour" className="cursor-pointer font-semibold text-foreground">
                Available for Tour
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Property Specs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Property Category</Label>
                <Select value={formData.category} onValueChange={(value) => setField("category", value)}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!isLotListing && (
                <div className="space-y-2">
                  <Label htmlFor="building_size">Building Size (sqm)</Label>
                  <Input id="building_size" name="building_size" type="number" min="0" value={formData.building_size} onChange={handleChange} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="condition">Property Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => setField("condition", value)}>
                  <SelectTrigger id="condition"><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_CONDITIONS.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_quality">Location Quality</Label>
                <Select value={formData.location_quality} onValueChange={(value) => setField("location_quality", value)}>
                  <SelectTrigger id="location_quality"><SelectValue placeholder="Select location quality" /></SelectTrigger>
                  <SelectContent>
                    {LOCATION_QUALITIES.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isLotListing ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="num_bedrooms" className="flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground" /> Bedrooms
                  </Label>
                  <Input id="num_bedrooms" name="num_bedrooms" type="number" min="0" value={formData.num_bedrooms} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_bathrooms" className="flex items-center gap-1.5">
                    <Bath className="h-3.5 w-3.5 text-muted-foreground" /> Bathrooms
                  </Label>
                  <Input id="num_bathrooms" name="num_bathrooms" type="number" min="1" value={formData.num_bathrooms} onChange={handleChange} />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Lot listings only use lot area. Building size, bedrooms, and bathrooms are removed automatically.
              </div>
            )}
          </CardContent>
        </Card>

        {valuation && formData.type === "SALE" && (
          <CmaRecommendationCard
            valuation={valuation}
            isLoading={isLoadingValuation}
            showApplyButton
            onApplyRecommended={() => setField("price", String(valuation.recommended_price))}
            title="CMA Price Recommendation"
          />
        )}

        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label>Municipality *</Label>
              <Select value={formData.property_municipality} onValueChange={(value) => setField("property_municipality", value)}>
                <SelectTrigger><SelectValue placeholder="Select municipality" /></SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={String(municipality.id)}>{municipality.municipality_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_address">Full Address *</Label>
              <Input id="property_address" name="property_address" value={formData.property_address} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Property Photos</CardTitle>
            </div>
            <CardDescription>Add or remove photos. Hover over an image to delete it.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <PropertyImageManager
              mode="manage"
              propertyId={parseInt(id, 10)}
              existingImages={property.images || []}
              canManage={canEdit}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/properties/${id}`)} className="h-12 px-8">Cancel</Button>
          <Button type="submit" disabled={isPending} className="h-12 rounded-xl px-12 text-lg font-bold shadow-lg">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={success}
        title="Changes Saved!"
        description="Your property listing has been updated successfully."
        confirmLabel="View Listing"
        onConfirm={() => navigate(`/properties/${id}`)}
        onOpenChange={(open) => { if (!open) setSuccess(false); }}
      />
    </div>
  );
}
