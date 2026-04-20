import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useProperty, useUpdateProperty } from "@/services/api/useProperties";
import { useMunicipalities } from "@/services/api/useMunicipalities";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyImageManager from "@/components/PropertyImageManager";
import {
  Building2, MapPin, Ruler, AlertCircle, CheckCircle2,
  ImagePlus, BedDouble, Bath, Layers, ArrowLeft,
} from "lucide-react";

const LISTING_TYPES = [
  { value: "SALE",        label: "For Sale" },
  { value: "RENT",        label: "For Rent" },
  { value: "LEASE",       label: "For Lease" },
  { value: "FORECLOSURE", label: "Foreclosure" },
];

export default function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: property, isLoading: loadingProp } = useProperty(id);
  const { data: municipalities = [] } = useMunicipalities();
  const { mutateAsync: updateProperty, isPending } = useUpdateProperty(id);
  const imageManagerRef = useRef(null);

  const [formData, setFormData] = useState(null);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // Populate form once property loads
  useEffect(() => {
    if (!property) return;
    setFormData({
      property_name:         property.property_name || "",
      property_description:  property.property_description || "",
      property_address:      property.property_address || "",
      property_municipality: String(property.property_municipality?.id || ""),
      property_size:         String(property.property_size || ""),
      price:                 String(property.price || ""),
      type:                  property.type || "SALE",
      num_bedrooms:          String(property.num_bedrooms ?? 0),
      num_bathrooms:         String(property.num_bathrooms ?? 1),
      is_available_for_tour: property.is_available_for_tour ?? false,
    });
  }, [property]);

  // Permission guard — only owner, agent, or admin can edit
  const canEdit = user && (
    user.is_superuser ||
    user.groups?.includes("Admin") ||
    user.groups?.includes("SuperAdmin") ||
    user.id === property?.owner_id ||
    user.id === property?.agent_id
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.property_municipality) {
      setError("Please select a municipality.");
      return;
    }

    try {
      await updateProperty({
        ...formData,
        property_municipality: parseInt(formData.property_municipality),
        property_size:         parseFloat(formData.property_size),
        price:                 parseFloat(formData.price) || 0,
        num_bedrooms:          parseInt(formData.num_bedrooms) || 0,
        num_bathrooms:         parseInt(formData.num_bathrooms) || 1,
      });

      setSuccess(true);
      setTimeout(() => navigate(`/properties/${id}`), 1500);
    } catch (err) {
      setError(err.message || "Failed to update listing.");
    }
  };

  if (loadingProp || !formData) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You don't have permission to edit this property.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/properties/${id}`)} className="gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Back to Listing
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
        <p className="text-gray-500">Update the details of <span className="font-semibold text-blue-800">{property.property_name}</span>.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-5 w-5" /><AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600" /><AlertTitle className="text-green-900">Saved!</AlertTitle>
          <AlertDescription>Listing updated successfully. Redirecting...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Basic Info ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Basic Information</CardTitle></div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name *</Label>
                <Input id="property_name" name="property_name" value={formData.property_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Listing Type *</Label>
                <Select value={formData.type} onValueChange={v => setField("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_description">Description *</Label>
              <Textarea id="property_description" name="property_description"
                className="min-h-[140px]" value={formData.property_description} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_size" className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-gray-400" /> Size (sqm) *
                </Label>
                <Input id="property_size" name="property_size" type="number" min="1"
                  value={formData.property_size} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Asking Price (₱)</Label>
                <Input id="price" name="price" type="number" min="0"
                  value={formData.price} onChange={handleChange} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <input type="checkbox" id="is_available_for_tour" name="is_available_for_tour"
                checked={formData.is_available_for_tour} onChange={handleChange}
                className="w-4 h-4 accent-blue-800 cursor-pointer" />
              <Label htmlFor="is_available_for_tour" className="cursor-pointer font-semibold text-blue-900">
                Available for Tour
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* ── Specs ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><Layers className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Property Specs</CardTitle></div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num_bedrooms" className="flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-gray-400" /> Bedrooms
                </Label>
                <Input id="num_bedrooms" name="num_bedrooms" type="number" min="0"
                  value={formData.num_bedrooms} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_bathrooms" className="flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5 text-gray-400" /> Bathrooms
                </Label>
                <Input id="num_bathrooms" name="num_bathrooms" type="number" min="1"
                  value={formData.num_bathrooms} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Location ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Location</CardTitle></div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Municipality *</Label>
              <Select value={formData.property_municipality} onValueChange={v => setField("property_municipality", v)}>
                <SelectTrigger><SelectValue placeholder="Select municipality" /></SelectTrigger>
                <SelectContent>
                  {municipalities.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.municipality_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_address">Full Address *</Label>
              <Input id="property_address" name="property_address"
                value={formData.property_address} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        {/* ── Photos ── */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2"><ImagePlus className="w-5 h-5 text-blue-800" /><CardTitle className="text-lg">Property Photos</CardTitle></div>
            <CardDescription>Add or remove photos. Hover over an image to delete it.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <PropertyImageManager
              mode="manage"
              propertyId={parseInt(id)}
              existingImages={property.images || []}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/properties/${id}`)} className="h-12 px-8">Cancel</Button>
          <Button type="submit" disabled={isPending}
            className="h-12 px-12 bg-blue-800 hover:bg-blue-900 text-white font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
