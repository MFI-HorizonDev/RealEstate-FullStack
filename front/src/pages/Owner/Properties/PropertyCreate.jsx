import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useCreateProperty } from "@/services/api/useProperties";
import { useMunicipalities } from "@/services/api/useMunicipalities";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PropertyImageManager from "@/components/PropertyImageManager";
import {
  Building2, MapPin, Ruler, AlertCircle, CheckCircle2,
  ImagePlus, BedDouble, Bath, Layers, Plus, Trash2,
  Sofa, Star, ToggleLeft,
} from "lucide-react";

const LISTING_TYPES = [
  { value: "SALE",        label: "For Sale" },
  { value: "RENT",        label: "For Rent" },
  { value: "LEASE",       label: "For Lease" },
  { value: "FORECLOSURE", label: "Foreclosure" },
];

const PROPERTY_CATEGORIES = [
  "House & Lot", "Condominium", "Apartment", "Villa",
  "Townhouse", "Commercial Space", "Warehouse", "Land",
];

const PRESET_AMENITIES = [
  "Swimming Pool", "Garage", "Garden", "Gym", "CCTV",
  "Solar Panels", "Balcony", "Elevator", "Security Guard",
  "Backup Generator", "Clubhouse", "Basketball Court",
];

const emptyAmenity = () => ({ name: "", amenity_type: "Basic", price: "" });

export default function PropertyCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutateAsync: createProperty, isPending } = useCreateProperty();
  const { data: municipalities = [] } = useMunicipalities();
  const imageManagerRef = useRef(null);

  const [formData, setFormData] = useState({
    property_name: "",
    property_description: "",
    property_address: "",
    property_municipality: "",
    property_size: "",
    price: "",
    type: "SALE",
    num_bedrooms: "0",
    num_bathrooms: "1",
    is_available_for_tour: false,
    // extra UI-only field (not sent to backend)
    property_category: "",
    num_floors: "",
    parking_slots: "",
    year_built: "",
  });

  const [amenities, setAmenities] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Amenity helpers ──────────────────────────────────────────────────────
  const addAmenity = (name = "") => {
    setAmenities(prev => [...prev, { ...emptyAmenity(), name }]);
  };

  const updateAmenity = (idx, field, value) => {
    setAmenities(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const removeAmenity = (idx) => {
    setAmenities(prev => prev.filter((_, i) => i !== idx));
  };

  const togglePreset = (name) => {
    const exists = amenities.find(a => a.name === name);
    if (exists) {
      setAmenities(prev => prev.filter(a => a.name !== name));
    } else {
      addAmenity(name);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.property_municipality) {
      setError("Please select a municipality.");
      return;
    }

    // Strip UI-only fields before sending
    const { property_category, num_floors, parking_slots, year_built, ...backendData } = formData;

    const payload = {
      ...backendData,
      property_municipality: parseInt(formData.property_municipality),
      property_size: parseFloat(formData.property_size),
      price: parseFloat(formData.price) || 0,
      num_bedrooms: parseInt(formData.num_bedrooms) || 0,
      num_bathrooms: parseInt(formData.num_bathrooms) || 1,
    };

    // Build description with specs appended
    const specLines = [];
    if (property_category)  specLines.push(`Property Type: ${property_category}`);
    if (num_floors)         specLines.push(`Floors: ${num_floors}`);
    if (parking_slots)      specLines.push(`Parking Slots: ${parking_slots}`);
    if (year_built)         specLines.push(`Year Built: ${year_built}`);
    if (specLines.length) {
      payload.property_description =
        (payload.property_description ? payload.property_description + "\n\n" : "") +
        "--- Property Specs ---\n" + specLines.join("\n");
    }

    try {
      const result = await createProperty(payload);

      // Upload amenities via separate API calls
      const token = localStorage.getItem("access");
      for (const amenity of amenities) {
        if (!amenity.name.trim()) continue;
        await fetch(`http://127.0.0.1:8000/api/properties/${result.id}/amenities/create/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: amenity.name,
            amenity_type: amenity.amenity_type,
            price: parseInt(amenity.price) || 0,
          }),
        });
      }

      // Upload images
      if (imageManagerRef.current) {
        await imageManagerRef.current.uploadAll(result.id);
      }

      setSuccess(true);
      setTimeout(() => navigate(`/properties/${result.id}`), 1500);
    } catch (err) {
      setError(err.message || "Failed to create listing. Please check your inputs.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
        <p className="text-gray-500">List your property with full specs so buyers know exactly what to expect.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-5 w-5" /><AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600" /><AlertTitle className="text-green-900">Success!</AlertTitle>
          <AlertDescription>Listing created. Redirecting to property page...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── 1. Basic Info ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Basic Information</CardTitle></div>
            <CardDescription>Name, type, description and pricing.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name *</Label>
                <Input id="property_name" name="property_name" placeholder="e.g. Modern Villa in BGC"
                  value={formData.property_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Listing Type *</Label>
                <Select value={formData.type} onValueChange={v => setField("type", v)}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_description">Description *</Label>
              <Textarea id="property_description" name="property_description"
                placeholder="Describe the property, its features, and what makes it special..."
                className="min-h-[120px]" value={formData.property_description} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_size" className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-gray-400" /> Size (sqm) *
                </Label>
                <Input id="property_size" name="property_size" type="number" min="1"
                  placeholder="e.g. 120" value={formData.property_size} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Asking Price (₱)</Label>
                <Input id="price" name="price" type="number" min="0"
                  placeholder="Leave blank to auto-calculate" value={formData.price} onChange={handleChange} />
                <p className="text-xs text-gray-400">If left blank, price is calculated from municipality rate + amenities.</p>
              </div>
            </div>

            {/* Tour availability toggle */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <input type="checkbox" id="is_available_for_tour" name="is_available_for_tour"
                checked={formData.is_available_for_tour} onChange={handleChange}
                className="w-4 h-4 accent-blue-800 cursor-pointer" />
              <div>
                <Label htmlFor="is_available_for_tour" className="cursor-pointer font-semibold text-blue-900">
                  Available for Tour
                </Label>
                <p className="text-xs text-blue-600 mt-0.5">Allow buyers to schedule a viewing of this property.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Property Specs ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><Layers className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Property Specs</CardTitle></div>
            <CardDescription>Rooms, floors, and property category — what buyers expect to see.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num_bedrooms" className="flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-gray-400" /> Bedrooms
                </Label>
                <Input id="num_bedrooms" name="num_bedrooms" type="number" min="0" max="20"
                  value={formData.num_bedrooms} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_bathrooms" className="flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5 text-gray-400" /> Bathrooms
                </Label>
                <Input id="num_bathrooms" name="num_bathrooms" type="number" min="1" max="20"
                  value={formData.num_bathrooms} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_floors" className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" /> Floors
                </Label>
                <Input id="num_floors" name="num_floors" type="number" min="1"
                  placeholder="e.g. 2" value={formData.num_floors} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking_slots">Parking Slots</Label>
                <Input id="parking_slots" name="parking_slots" type="number" min="0"
                  placeholder="e.g. 1" value={formData.parking_slots} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_category">Property Category</Label>
                <Select value={formData.property_category} onValueChange={v => setField("property_category", v)}>
                  <SelectTrigger id="property_category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_built">Year Built</Label>
                <Input id="year_built" name="year_built" type="number" min="1900" max={new Date().getFullYear()}
                  placeholder="e.g. 2018" value={formData.year_built} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 3. Location ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Location</CardTitle></div>
            <CardDescription>Where is this property located?</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="property_municipality">Municipality *</Label>
              <Select value={formData.property_municipality} onValueChange={v => setField("property_municipality", v)}>
                <SelectTrigger id="property_municipality"><SelectValue placeholder="Select municipality" /></SelectTrigger>
                <SelectContent>
                  {municipalities.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.municipality_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_address">Full Address *</Label>
              <Input id="property_address" name="property_address"
                placeholder="Street address, building name, floor/unit number..."
                value={formData.property_address} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Amenities ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><Sofa className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Amenities</CardTitle></div>
            <CardDescription>Add amenities that affect the property valuation. Basic cap ₱100K, Luxury cap ₱250K.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Quick-add presets */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_AMENITIES.map(name => {
                  const active = amenities.some(a => a.name === name);
                  return (
                    <button key={name} type="button" onClick={() => togglePreset(name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? "bg-blue-800 text-white border-blue-800"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-800"
                      }`}>
                      {active ? "✓ " : "+ "}{name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amenity rows */}
            {amenities.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Added Amenities</p>
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="col-span-5">
                      <Input placeholder="Amenity name" value={amenity.name}
                        onChange={e => updateAmenity(idx, "name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="col-span-3">
                      <Select value={amenity.amenity_type} onValueChange={v => updateAmenity(idx, "amenity_type", v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input type="number" min="0" placeholder="Price ₱"
                        value={amenity.price} onChange={e => updateAmenity(idx, "price", e.target.value)}
                        className="h-9 text-sm" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => removeAmenity(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button type="button" variant="outline" size="sm" onClick={() => addAmenity()}
              className="gap-2 border-blue-200 text-blue-800 hover:bg-blue-50">
              <Plus className="w-4 h-4" /> Add Custom Amenity
            </Button>
          </CardContent>
        </Card>

        {/* ── 5. Photos ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><ImagePlus className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Property Photos</CardTitle></div>
            <CardDescription>Add photos to attract more buyers. The first image will be the primary photo.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <PropertyImageManager ref={imageManagerRef} mode="preview" />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-12 px-8">Cancel</Button>
          <Button type="submit" disabled={isPending}
            className="h-12 px-12 bg-blue-800 hover:bg-blue-900 text-white font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95">
            {isPending ? "Creating..." : "Create Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
