import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useProperty } from "@/hooks/api/properties/UseProperties";
import { useCreateTour } from "@/hooks/api/tours/useTours";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CircleCheckBig, MapPin, Bed, Bath, Square, CalendarCheck, ShieldCheck, X, Edit3, Images } from "lucide-react";
import { BASE_URL } from "@/hooks/api/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import PropertyImageManager from "@/components/PropertyImageManager";
import { canEditProperty } from "@/features/properties/api/permissions";

export default function PropertyDetails() {
  const { id } = useParams();
  const { data: property, isLoading: loadingProperty, isError, error } = useProperty(id);
  const { mutateAsync: createTour, isPending: isBooking } = useCreateTour();
  const { user, isLoading: loadingAuth } = useAuth();
  const { isAuthenticated, isAdmin, isAgent, isOwner, isBuyer, isAuthLoading } = useContextAuth();
  const navigate = useNavigate();

  const canEdit = !isAuthLoading && !loadingProperty && property
    ? canEditProperty({ user, isAdmin }, property)
    : false;
  const isLotListing = property?.category === "LOT";

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
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto mt-20 max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Property not found</h2>
        <p className="mb-8 text-muted-foreground">{error?.message || "This property may have been removed or is unavailable."}</p>
        <Link to="/all-properties">
          <Button>Back to Properties</Button>
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

  const PLACEHOLDER = `${BASE_URL}/media/propertyimg/default.jpg`;
  const images = property.images && property.images.length > 0 ? property.images : [{ image: PLACEHOLDER }];
  const formattedPrice =
    property.price
      ? property.type === "RENT"
        ? `₱${Number(property.price).toLocaleString()}/month`
        : `₱${(property.price / 1000000).toFixed(2)}M`
      : "Price on Request";
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
      await createTour({ property: property.id, tour_datetime });
      setBookingSuccess(true);
      setShowBookingForm(false);
    } catch (err) {
      if (err.data?.detail) {
        setBookingError(err.data.detail);
      } else if (err.data?.non_field_errors) {
        setBookingError(err.data.non_field_errors[0]);
      } else {
        setBookingError(err.message || "Failed to book tour. Please try again.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold tracking-wide text-primary">
              {property.status}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold tracking-wide text-muted-foreground">
              {isLotListing ? "Lot" : property.type || "Property"}
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            {property.property_name || `Property ${property.id}`}
          </h1>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-5 w-5 text-muted-foreground" />
            <span className="text-lg">{property.property_address || "Address not provided"}</span>
          </div>
        </div>
        <div className="md:text-right">
          <p className="mb-1 text-sm font-medium text-muted-foreground">Asking Price</p>
          <p className="text-4xl font-bold text-primary">
            {formattedPrice}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <div className="mb-3 h-[40vh] min-h-[280px] w-full overflow-hidden rounded-2xl bg-muted md:h-[50vh]">
          <img src={images[activeImage].image} alt="Main property view" className="h-full w-full object-cover" />
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeImage === idx ? "border-primary" : "border-transparent opacity-60"
                }`}
              >
                <img src={img.image} className="h-full w-full object-cover" alt={`Thumb ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}

        <div className="hidden h-[50vh] min-h-[400px] grid-cols-1 gap-4 md:grid md:grid-cols-4 md:-mt-[calc(50vh+0.75rem)]">
          <div className="md:col-span-3" />
          <div className="hidden flex-col gap-4 overflow-y-auto pr-2 md:flex">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative h-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  activeImage === idx ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img.image} className="h-full w-full object-cover" alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Overview</h2>
            <div className="flex flex-wrap gap-8 border-y border-border py-6">
              {!isLotListing && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Bed className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bedrooms</p>
                      <p className="text-xl font-bold text-foreground">{property.num_bedrooms || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Bath className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bathrooms</p>
                      <p className="text-xl font-bold text-foreground">{property.num_bathrooms || "-"}</p>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Square className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{isLotListing ? "Lot Area (sqm)" : "Size (sqm)"}</p>
                  <p className="text-xl font-bold text-foreground">{property.property_size || "-"}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Description</h2>
            <div className="prose prose-lg max-w-none leading-relaxed text-muted-foreground">
              {property.property_description ? (
                property.property_description.split("\n").map((para, i) => <p key={i} className="mb-4">{para}</p>)
              ) : (
                <p>No description provided for this property.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Amenities</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-foreground">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
                    <span className="font-medium">{amenity.name}</span>
                    {amenity.amenity_type === "Luxury" && (
                      <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Premium
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No specific amenities listed.</p>
            )}
          </section>

          {canEdit && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Manage Photos</h2>
                <Button variant="outline" size="sm" onClick={() => setShowImageManager((value) => !value)} className="gap-2">
                  <Images className="h-4 w-4" />
                  {showImageManager ? "Hide" : "Edit Photos"}
                </Button>
              </div>
              {showImageManager && (
                <Card className="border-border bg-muted/30">
                  <CardContent className="p-5">
                    <PropertyImageManager
                      mode="manage"
                      propertyId={property.id}
                      existingImages={property.images || []}
                      canManage={canEdit}
                    />
                  </CardContent>
                </Card>
              )}
            </section>
          )}
        </div>

        {/* Sticky Action Sidebar */}
        {!(isAgent || isOwner || isAdmin) && (
        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-foreground">Interested in this property?</h3>
            <p className="mb-6 text-sm text-muted-foreground">Schedule a viewing or contact the agent directly to get more details.</p>

            <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                {property.type === "RENT" ? "Monthly Rent" : "Estimated Value"}
              </p>
              <p className="text-2xl font-bold text-primary">
                {property.type === "RENT"
                  ? (property.price ? `₱${Number(property.price).toLocaleString()}/month` : "TBD")
                  : (property.price ? `₱${(property.price / 1000000).toFixed(2)}M` : "TBD")}
              </p>
            </div>

            {bookingSuccess && (
              <Alert className="mb-6 border-green-500/20 bg-green-500/10 text-green-800 dark:text-green-200">
                <CircleCheckBig className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">Tour Requested!</AlertTitle>
                <AlertDescription>Your agent will confirm the schedule soon.</AlertDescription>
              </Alert>
            )}

            {bookingError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle>Booking Failed</AlertTitle>
                <AlertDescription>{bookingError}</AlertDescription>
              </Alert>
            )}

            {isAuthLoading ? (
              <div className="space-y-3">
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            ) : !showBookingForm ? (
              <div className="space-y-4">
                {isBuyer ? (
                  <Button onClick={() => setShowBookingForm(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold">
                    <CalendarCheck className="h-5 w-5" />
                    Book a Tour
                  </Button>
                ) : !isAuthenticated ? (
                  <Button onClick={() => (window.location.href = "/login")} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold">
                    <CalendarCheck className="h-5 w-5" />
                    Login to Book
                  </Button>
                ) : null}

                {canEdit && (
                  <Button variant="secondary" onClick={() => navigate(`/properties/${property.id}/edit`)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border font-semibold">
                    <Edit3 className="h-5 w-5" />
                    Edit Listing
                  </Button>
                )}
                {canEdit && (
                  <Button variant="outline" onClick={() => setShowImageManager((value) => !value)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold">
                    <Images className="h-5 w-5" />
                    {showImageManager ? "Hide Photo Manager" : "Manage Photos"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-foreground">Select Date and Time</h4>
                  <button onClick={() => setShowBookingForm(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleBookTour} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm">Date</Label>
                    <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={tourDate} onChange={(e) => setTourDate(e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm">Time</Label>
                    <Input id="time" type="time" value={tourTime} onChange={(e) => setTourTime(e.target.value)} className="bg-background" />
                  </div>
                  <Button type="submit" disabled={isBooking} className="w-full font-semibold">
                    {isBooking ? "Submitting..." : "Confirm Booking"}
                  </Button>
                </form>
              </div>
            )}

            {isBuyer && (
              <Button variant="outline" onClick={contactAgent} className="h-12 w-full rounded-xl font-semibold">
                Contact Agent
              </Button>
            )}

            <div className="mt-6 border-t border-border pt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Property ID: {property.id} • Listed under {property.property_municipality?.municipality_name || "Unknown"}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
