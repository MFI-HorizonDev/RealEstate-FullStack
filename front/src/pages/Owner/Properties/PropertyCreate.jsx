import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCreateProperty } from "@/hooks/api/properties/UseProperties";
import { useValuationPreviewPOST } from "@/hooks/api/properties/UseValuationPreview";
import { useMunicipalities } from "@/hooks/api/municipalities/UseGetMunicipalities";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SuccessModal from "@/components/ui/SuccessModal";
import PropertyImageManager from "@/components/PropertyImageManager";
import { API_BASE_URL } from "@/hooks/api/config";
import { notify } from "@/lib/notifications";
import {
  Building2, MapPin, Ruler, AlertCircle, CheckCircle2,
  ImagePlus, BedDouble, Bath, Layers, Plus, Trash2, Sofa,
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

const PRESET_AMENITIES = [
  "Swimming Pool", "Garage", "Garden", "Gym", "CCTV",
  "Solar Panels", "Balcony", "Elevator", "Security Guard",
  "Backup Generator", "Clubhouse", "Basketball Court",
];

const emptyAmenity = () => ({ name: "", amenity_type: "Basic", price: "" });

export default function PropertyCreate() {
  const navigate = useNavigate();
  const { isAdmin, isAgent, isOwner } = useContextAuth();
  const { mutateAsync: createProperty, isPending } = useCreateProperty();
  const { data: municipalities = [] } = useMunicipalities();
  const { mutate: getValuation, data: valuation, isPending: isLoadingValuation } = useValuationPreviewPOST();
  const imageManagerRef = useRef(null);

  const [formData, setFormData] = useState({
    property_name: "",
    property_description: "",
    property_address: "",
    property_municipality: "",
    property_size: "",
    price: "",
    type: "SALE",
    category: "HOUSE_AND_LOT",
    condition: "GOOD",
    location_quality: "SUBURBAN",
    building_size: "",
    num_bedrooms: "0",
    num_bathrooms: "1",
    is_available_for_tour: false,
    num_floors: "",
    parking_slots: "",
    year_built: "",
  });

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
    if (!formData.property_municipality || !formData.property_size || formData.type === "RENT") return;
    
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
    formData.property_municipality,
    formData.property_size,
    formData.category,
    formData.condition,
    formData.location_quality,
    formData.building_size,
    formData.type
  ]);
  const [amenities, setAmenities] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);

  const isLotListing = formData.category === "LOT";
  const isApartmentOrCondo = formData.category === "APARTMENT" || formData.category === "CONDO";
  const isCondo = formData.category === "CONDO";
  const canCreate = isAgent || isOwner || isAdmin;

  // Amenity presets filtered by category rules
  const visiblePresetAmenities = PRESET_AMENITIES.filter((name) => {
    if (isCondo && name === "Elevator") return false;
    return true;
  });

  const addAmenity = (name = "") => {
    setAmenities((prev) => [...prev, { ...emptyAmenity(), name }]);
  };

  const updateAmenity = (idx, field, value) => {
    setAmenities((prev) => prev.map((amenity, index) => (index === idx ? { ...amenity, [field]: value } : amenity)));
  };

  const removeAmenity = (idx) => {
    setAmenities((prev) => prev.filter((_, index) => index !== idx));
  };

  const togglePreset = (name) => {
    const exists = amenities.find((amenity) => amenity.name === name);
    if (exists) {
      setAmenities((prev) => prev.filter((amenity) => amenity.name !== name));
      return;
    }
    addAmenity(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setError("");
    setCreatedPropertyId(null);

    if (!formData.property_municipality) {
      setError("Please select a municipality.");
      return;
    }

    const pSize = parseFloat(formData.property_size);
    if (isNaN(pSize) || pSize <= 0) {
      setError("Property size must be a valid positive number.");
      return;
    }

    const { num_floors, parking_slots, year_built, ...backendData } = formData;
    const payload = {
      ...backendData,
      property_municipality: parseInt(formData.property_municipality, 10),
      property_size: pSize,
      building_size: isLotListing ? 0 : (parseFloat(formData.building_size) || 0),
      num_bedrooms: isLotListing ? 0 : (parseInt(formData.num_bedrooms, 10) || 0),
      num_bathrooms: isLotListing ? 0 : (parseInt(formData.num_bathrooms, 10) || 1),
    };

    if (formData.type === "RENT") {
      const price = parseFloat(formData.price);
      payload.price = isNaN(price) ? 0 : price;
    } else if (formData.price !== "") {
      const price = parseFloat(formData.price);
      payload.price = isNaN(price) ? 0 : price;
    }

    const specLines = [];
    if (formData.category) {
      const categoryLabel =
        PROPERTY_CATEGORIES.find((category) => category.value === formData.category)?.label || formData.category;
      specLines.push(`Property Type: ${categoryLabel}`);
    }
    if (!isLotListing && !isApartmentOrCondo && num_floors) specLines.push(`Floors: ${num_floors}`);
    if (!isLotListing && parking_slots) specLines.push(`Parking Slots: ${parking_slots}`);
    if (!isLotListing && year_built) specLines.push(`Year Built: ${year_built}`);
    if (specLines.length) {
      payload.property_description =
        (payload.property_description ? `${payload.property_description}\n\n` : "") +
        "--- Property Specs ---\n" +
        specLines.join("\n");
    }

    try {
      const result = await createProperty(payload);
      const token = localStorage.getItem("access");

      for (const amenity of amenities) {
        if (!amenity.name.trim()) continue;
        await fetch(`${API_BASE_URL}/properties/${result.id}/amenities/create/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: amenity.name,
            amenity_type: amenity.amenity_type,
            price: parseInt(amenity.price, 10) || 0,
          }),
        });
      }

      if (imageManagerRef.current) {
        await imageManagerRef.current.uploadAll(result.id);
      }

      setCreatedPropertyId(result.id);
      setShowSuccess(true);
    } catch (err) {
      notify.apiError(err, "Failed to create listing. Please check your inputs.");
      try {
        const errorData = JSON.parse(err.message);
        if (typeof errorData === "object" && !Array.isArray(errorData)) {
          setFieldErrors(errorData);
          setError("Please correct the errors highlighted below.");
        } else {
          setError(err.message || "Failed to create listing. Please check your inputs.");
        }
      } catch {
        setError(err.message || "Failed to create listing. Please check your inputs.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const setField = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // When switching to APARTMENT or CONDO, clear num_floors
      if (name === "category" && (value === "APARTMENT" || value === "CONDO")) {
        updated.num_floors = "";
      }
      return updated;
    });
    // When switching to CONDO, remove Elevator from amenities
    if (name === "category" && value === "CONDO") {
      setAmenities((prev) => prev.filter((a) => a.name !== "Elevator"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Create New Listing</h1>
        <p className="text-muted-foreground">List your property with full specs so buyers know exactly what to expect.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
            <CardDescription>Name, type, description and pricing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name *</Label>
                <Input
                  id="property_name"
                  name="property_name"
                  placeholder="e.g. Modern Condo in BGC"
                  value={formData.property_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Listing Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setField("type", value)}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_description">Description *</Label>
              <Textarea
                id="property_description"
                name="property_description"
                placeholder="Describe the property, its features, and what makes it special..."
                className="min-h-[120px]"
                value={formData.property_description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property_size" className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" /> {isLotListing ? "Lot Area (sqm) *" : "Size (sqm) *"}
                </Label>
                <Input
                  id="property_size"
                  name="property_size"
                  type="number"
                  min="1"
                  placeholder="e.g. 120"
                  value={formData.property_size}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Asking Price (PHP)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder={formData.type === "RENT" ? "Required for rent listings" : "Leave blank to auto-calculate"}
                  value={formData.price}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.type === "RENT"
                    ? "For Rent listings use a fixed manual price."
                    : "For Sale can be auto-calculated from municipality rate and market comparisons."}
                </p>
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
              <div>
                <Label htmlFor="is_available_for_tour" className="cursor-pointer font-semibold text-foreground">
                  Available for Tour
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Allow buyers to schedule a viewing of this property.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Property Specs</CardTitle>
            </div>
            <CardDescription>Rooms, floors, and category details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Property Category</Label>
                <Select value={formData.category} onValueChange={(value) => setField("category", value)}>
                  <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!isLotListing && (
                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    name="year_built"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2018"
                    value={formData.year_built}
                    onChange={handleChange}
                  />
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
              <>
                <div className={`grid grid-cols-2 gap-4 ${isApartmentOrCondo ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
                  <div className="space-y-2">
                    <Label htmlFor="num_bedrooms" className="flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5 text-muted-foreground" /> Bedrooms
                    </Label>
                    <Input id="num_bedrooms" name="num_bedrooms" type="number" min="0" max="20" value={formData.num_bedrooms} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="num_bathrooms" className="flex items-center gap-1.5">
                      <Bath className="h-3.5 w-3.5 text-muted-foreground" /> Bathrooms
                    </Label>
                    <Input id="num_bathrooms" name="num_bathrooms" type="number" min="1" max="20" value={formData.num_bathrooms} onChange={handleChange} />
                  </div>
                  {!isApartmentOrCondo && (
                    <div className="space-y-2">
                      <Label htmlFor="num_floors" className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" /> Floors
                      </Label>
                      <Input id="num_floors" name="num_floors" type="number" min="1" placeholder="e.g. 2" value={formData.num_floors} onChange={handleChange} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="parking_slots">Parking Slots</Label>
                    <Input id="parking_slots" name="parking_slots" type="number" min="0" placeholder="e.g. 1" value={formData.parking_slots} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building_size">Building Size (sqm)</Label>
                  <Input id="building_size" name="building_size" type="number" min="0" placeholder="e.g. 80" value={formData.building_size} onChange={handleChange} />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Lot listings only use lot area. Building size, bedrooms, bathrooms, floors, and parking are excluded automatically.
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
            <CardDescription>Where is this property located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="property_municipality">Municipality *</Label>
              <Select value={formData.property_municipality} onValueChange={(value) => setField("property_municipality", value)}>
                <SelectTrigger id="property_municipality"><SelectValue placeholder="Select municipality" /></SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={String(municipality.id)}>
                      {municipality.municipality_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_address">Full Address *</Label>
              <Input
                id="property_address"
                name="property_address"
                placeholder="Street address, building name, floor/unit number..."
                value={formData.property_address}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {canCreate && (
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <Sofa className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Amenities</CardTitle>
              </div>
              <CardDescription>Add amenities that affect valuation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Add</p>
                <div className="flex flex-wrap gap-2">
                  {visiblePresetAmenities.map((name) => {
                    const active = amenities.some((amenity) => amenity.name === name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => togglePreset(name)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        {active ? "Selected " : "Add "}{name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {amenities.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Added Amenities</p>
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                      <div className="col-span-5">
                        <Input placeholder="Amenity name" value={amenity.name} onChange={(e) => updateAmenity(idx, "name", e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="col-span-3">
                        <Select value={amenity.amenity_type} onValueChange={(value) => updateAmenity(idx, "amenity_type", value)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Luxury">Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input type="number" min="0" placeholder="Price PHP" value={amenity.price} onChange={(e) => updateAmenity(idx, "price", e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeAmenity(idx)} className="text-destructive transition-colors hover:opacity-80">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button type="button" variant="outline" size="sm" onClick={() => addAmenity()} className="gap-2">
                <Plus className="h-4 w-4" /> Add Custom Amenity
              </Button>
            </CardContent>
          </Card>
        )}

        {canCreate && (
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Property Photos</CardTitle>
              </div>
              <CardDescription>Add photos to attract more buyers. The first image will be the primary photo.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PropertyImageManager ref={imageManagerRef} mode="preview" canManage={canCreate} />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-12 px-8">Cancel</Button>
          <Button type="submit" disabled={isPending || !canCreate} className="h-12 rounded-xl px-12 text-lg font-bold shadow-lg">
            {isPending ? "Creating..." : "Create Listing"}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={!!createdPropertyId}
        title="Listing Created Successfully!"
        description="Your property listing has been created and is now live. You can view it, add more photos, or continue managing your listings."
        confirmLabel="View Listing"
        onConfirm={() => navigate(`/properties/${createdPropertyId}`)}
        onOpenChange={(open) => { if (!open) setCreatedPropertyId(null); }}
      />
    </div>
  );
}
