import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useProperty } from "@/services/api/useProperties";
import { useCreateTour } from "@/services/api/useTours";
import { useAuth } from "@/services/api/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CircleCheckBig, MapPin, Bed, Bath, Square, CalendarCheck, ShieldCheck, X, Edit3, Images } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyImageManager from "@/components/PropertyImageManager";

export default function PropertyDetails() {
  const { id } = useParams();
  const { data: property, isLoading: loadingProperty, isError, error } = useProperty(id);
  const { mutateAsync: createTour, isPending: isBooking } = useCreateTour();
  const { user, isLoggedIn, isLoading: loadingAuth } = useAuth();
  const { isAuthenticated } = useContextAuth();
  const navigate = useNavigate();
  
  const [activeImage, setActiveImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const isLoading = loadingProperty || loadingAuth;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
        <p className="text-gray-600 mb-8">{error?.message || "This property may have been removed or is unavailable."}</p>
        <Link to="/all-properties">
          <Button className="bg-blue-800 text-white">Back to Properties</Button>
        </Link>
      </div>
    );
  }

  const isOwnerOrAgent = user && (
    user.is_superuser ||
    user.groups?.includes("Admin") ||
    user.groups?.includes("SuperAdmin") ||
    user.id === property?.owner ||
    user.id === property?.agent
  );

  const images = property.images && property.images.length > 0
    ? property.images 
    : [{ image: "https://via.placeholder.com/800x600?text=No+Image+Available" }];
  const agentEmail = property?.agent_details?.email;
  const contactAgent = () => {
    if (agentEmail) {
      window.location.href = `mailto:${agentEmail}?subject=Inquiry about ${encodeURIComponent(property.property_name || "property")}`;
      return;
    }
    setBookingError("No agent contact email is available for this listing yet.");
  };

  const handleBookTour = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(false);

    if (!tourDate || !tourTime) {
      setBookingError("Please select both date and time.");
      return;
    }

    try {
      const tour_datetime = new Date(`${tourDate}T${tourTime}`).toISOString();
      await createTour({
        property: property.id,
        tour_datetime
      });
      setBookingSuccess(true);
      setShowBookingForm(false);
    } catch (err) {
      if (err.data && err.data.detail) {
        setBookingError(err.data.detail);
      } else if (err.data && err.data.non_field_errors) {
        setBookingError(err.data.non_field_errors[0]);
      } else {
        setBookingError(err.message || "Failed to book tour. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
              {property.status}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
              {property.type || "Property"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {property.property_name || `Property ${property.id}`}
          </h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-1 text-gray-400" />
            <span className="text-lg">{property.property_address || "Address not provided"}</span>
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-gray-500 font-medium mb-1">Asking Price</p>
          <p className="text-4xl font-bold text-blue-900">
            {property.price ? `₱${(property.price / 1000000).toFixed(2)}M` : "Price on Request"}
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 h-[50vh] min-h-[400px]">
        <div className="md:col-span-3 bg-gray-100 rounded-2xl overflow-hidden relative">
          <img 
            src={images[activeImage].image} 
            alt="Main property view" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`relative h-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                activeImage === idx ? "border-blue-600 ring-2 ring-blue-600/30" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.image} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
            <div className="flex flex-wrap gap-8 py-6 border-y border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-800">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Bedrooms</p>
                  <p className="text-xl font-bold text-gray-900">{property.num_bedrooms || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-800">
                  <Bath className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Bathrooms</p>
                  <p className="text-xl font-bold text-gray-900">{property.num_bathrooms || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-800">
                  <Square className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Size (sqm)</p>
                  <p className="text-xl font-bold text-gray-900">{property.property_size || "-"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
              {property.property_description ? (
                property.property_description.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))
              ) : (
                <p>No description provided for this property.</p>
              )}
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map(amenity => (
                  <div key={amenity.id} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="font-medium">{amenity.name}</span>
                    {amenity.amenity_type === 'Luxury' && (
                      <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-auto">
                        Premium
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific amenities listed.</p>
            )}
          </section>

          {/* Image Manager — owner/agent only */}
          {isOwnerOrAgent && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Manage Photos</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageManager(v => !v)}
                  className="gap-2 border-blue-200 text-blue-800 hover:bg-blue-50"
                >
                  <Images className="w-4 h-4" />
                  {showImageManager ? "Hide" : "Edit Photos"}
                </Button>
              </div>
              {showImageManager && (
                <Card className="border-blue-100 bg-blue-50/20">
                  <CardContent className="p-5">
                    <PropertyImageManager
                      mode="manage"
                      propertyId={property.id}
                      existingImages={property.images || []}
                    />
                  </CardContent>
                </Card>
              )}
            </section>
          )}
        </div>

        {/* Sticky Action Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Interested in this property?</h3>
            <p className="text-gray-500 mb-6 text-sm">Schedule a viewing or contact the agent directly to get more details.</p>
            
            <div className="bg-blue-50/50 rounded-xl p-4 mb-6 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1 font-medium">Estimated Value</p>
              <p className="text-2xl font-bold text-blue-900">
                {property.price ? `₱${(property.price / 1000000).toFixed(2)}M` : "TBD"}
              </p>
            </div>

            {bookingSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <CircleCheckBig className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-900">Tour Requested!</AlertTitle>
                <AlertDescription>Your agent will confirm the schedule soon.</AlertDescription>
              </Alert>
            )}

            {bookingError && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-900">Booking Failed</AlertTitle>
                <AlertDescription>{bookingError}</AlertDescription>
              </Alert>
            )}

            {!showBookingForm ? (
              <div className="space-y-4">
                {isAuthenticated ? (
                  <Button 
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white h-12 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Book a Tour
                  </Button>
                ) : (
                  <Button
                    onClick={() => (window.location.href = "/login")}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white h-12 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Login to Book
                  </Button>
                )}

                {(user?.groups?.includes("Admin") || user?.id === property.owner || user?.id === property.agent) && (
                  <Button 
                    variant="secondary"
                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                    className="w-full h-12 text-blue-900 font-semibold rounded-xl flex items-center justify-center gap-2 border-2 border-blue-100 hover:bg-blue-50 transition-all"
                  >
                    <Edit3 className="w-5 h-5" />
                    Edit Listing
                  </Button>
                )}
                {isOwnerOrAgent && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowImageManager(v => !v)}
                    className="w-full h-12 text-blue-800 border-blue-200 hover:bg-blue-50 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Images className="w-5 h-5" />
                    {showImageManager ? "Hide Photo Manager" : "Manage Photos"}
                  </Button>
                )}
              </div>
            ) : (

              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900">Select Date & Time</h4>
                  <button onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleBookTour} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm">Time</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={tourTime}
                      onChange={(e) => setTourTime(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isBooking}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  >
                    {isBooking ? "Submitting..." : "Confirm Booking"}
                  </Button>
                </form>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={contactAgent}
              className="w-full h-12 text-blue-800 border-blue-200 hover:bg-blue-50 font-semibold rounded-xl transition-all"
            >
              Contact Agent
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Property ID: {property.id} • Listed under {property.property_municipality?.municipality_name || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
