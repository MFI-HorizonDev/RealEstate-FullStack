import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
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
import wowImage from "@/assets/wow.jpg";
import { ChevronLeft, ChevronRight, Zap, Shield, Users, Search } from "lucide-react";
import { useProperties } from "@/hooks/api/properties/UseGetProperties";
import { useMunicipalities } from "@/hooks/api/municipalities/UseGetMunicipalities";
import { Link, useNavigate } from "react-router";
import { isUserLoggedIn } from "@/hooks/api/authentication/useAuth";
import { BASE_URL } from "@/hooks/api/config";

const DEFAULT_PROPERTY_IMAGE = `${BASE_URL}/media/propertyimg/default.jpg`;

export default function App() {
  const carouselRefs = useRef([]);
  const navigate = useNavigate();
  const isLoggedIn = isUserLoggedIn();

  // Search widget state
  const [maxPrice, setMaxPrice] = useState(50000000);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");

  // Fetch data from backend
  const { data: propertyResponse, isLoading: loadingProperties } = useProperties({
    page: 1,
    enabled: isLoggedIn,
  });
  const properties = Array.isArray(propertyResponse?.results)
    ? propertyResponse.results
    : Array.isArray(propertyResponse)
      ? propertyResponse
      : [];
  const { data: municipalities = [] } = useMunicipalities({
    enabled: true,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (maxPrice && maxPrice < 50000000) params.set("maxPrice", maxPrice);
    if (location && location !== "any") params.set("municipality", location);
    if (propertyType && propertyType !== "all") params.set("type", propertyType);
    navigate(`/all-properties?${params.toString()}`);
  };

  const scrollLeft = (index) => {
    if (carouselRefs.current[index]) {
      carouselRefs.current[index].scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (index) => {
    if (carouselRefs.current[index]) {
      carouselRefs.current[index].scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const formatPropertyPrice = (property) => {
    if (!property?.price) return "N/A";
    if (property.type === "RENT") return `₱${Number(property.price).toLocaleString()}/month`;
    return `₱${(property.price / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="w-full">

      <div className="relative min-h-[100dvh] w-full overflow-hidden pt-[72px]">
        <img
          src={wowImage}
          className="w-full h-full object-cover"
          alt="Aerial view of premium residential properties and modern homes"
        />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white [text-shadow:_0_0_10px_rgba(0,0,0,0.9),_0_0_20px_rgba(0,0,0,0.7),_0_0_30px_rgba(0,0,0,0.5)] max-w-5xl">
            Find Your Perfect Home
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mb-10 text-white/90 [text-shadow:_0_0_8px_rgba(0,0,0,0.9),_0_0_16px_rgba(0,0,0,0.7),_0_0_24px_rgba(0,0,0,0.5)]">
            Discover premium properties tailored to your lifestyle and investment goals
          </p>
          <div className="w-full max-w-5xl bg-card rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Max Price
                  </Label>
                  <span className="text-sm font-bold text-primary">
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
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>₱1M</span>
                  <span>₱50M+</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Location
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full h-11 border-2 border-border rounded-lg focus:border-primary">
                    <SelectValue placeholder="Any Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    {Array.isArray(municipalities) && municipalities.map((municipality) => (
                      <SelectItem key={municipality.id} value={String(municipality.id)}>
                        {municipality.municipality_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Property Type
                </Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full h-11 border-2 border-border rounded-lg focus:border-primary">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SALE">For Sale</SelectItem>
                    <SelectItem value="RENT">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <Button
                onClick={handleSearch}
                className="bg-primary text-primary-foreground px-16 py-4 rounded-lg font-semibold hover:opacity-90 transition shadow-lg h-auto flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Properties
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/all-properties")}
                className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-accent transition h-auto"
              >
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20">
        <Card className="border border-border hover:shadow-lg transition">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">Quick Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Browse through hundreds of verified listings with detailed information and virtual tours
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:shadow-lg transition">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-amber-700 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl font-bold">Secure Process</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Complete transparency with verified sellers and secure transactions throughout
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:shadow-lg transition">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl font-bold">Expert Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Dedicated agents and specialists ready to assist you every step of the way
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-3">Featured Properties</h2>
          <p className="text-lg text-muted-foreground">Explore our handpicked selection of premium properties</p>
        </div>

        {loadingProperties && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading properties...</p>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="flex justify-center items-center h-96">
            <p className="text-muted-foreground text-lg">Sign in to view available properties.</p>
          </div>
        )}

        {isLoggedIn && !loadingProperties && Array.isArray(properties) && properties.length === 0 && (
          <div className="flex justify-center items-center h-96">
            <p className="text-muted-foreground text-lg">No properties available at the moment.</p>
          </div>
        )}

        {isLoggedIn && !loadingProperties && Array.isArray(properties) && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {properties.slice(0, 6).map((property, index) => (
              <Card key={property.id} className="overflow-hidden border border-border hover:shadow-xl transition duration-300 group">
                <div className="relative h-72 bg-muted overflow-hidden rounded-t-lg">
                  <div
                    ref={(el) => (carouselRefs.current[index] = el)}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-0 scrollbar-hide h-full"
                  >
                    {property.images && property.images.length > 0 ? (
                      property.images.map((imgObj, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={imgObj.image}
                          className="flex-shrink-0 w-full h-full object-cover snap-center"
                          alt={`${property.property_name} - photo ${imgIdx + 1}`}
                        />
                      ))
                    ) : (
                      <img
                        src={DEFAULT_PROPERTY_IMAGE}
                        className="flex-shrink-0 w-full h-full object-cover snap-center"
                        alt="No image available"
                      />
                    )}
                  </div>
                  
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm">
                      {property.status}
                    </span>
                  </div>

                  {property.images && property.images.length > 1 && (
                    <>
                      <Button
                        onClick={() => scrollLeft(index)}
                        variant="ghost"
                        size="icon"
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={24} />
                      </Button>
                      <Button
                        onClick={() => scrollRight(index)}
                        variant="ghost"
                        size="icon"
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={24} />
                      </Button>
                    </>
                  )}
                </div>

                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition">
                    {property.property_name || `Property ${property.id}`}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
                    <span className="font-semibold">Address:</span>
                    <span>{property.property_address || "Not specified"}</span>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Price</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPropertyPrice(property)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs font-medium">Size</p>
                      <p className="text-lg font-bold">{property.property_size || "—"}</p>
                      <p className="text-xs text-muted-foreground">sqm</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs font-medium">Beds</p>
                      <p className="text-lg font-bold">{property.num_bedrooms || "—"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs font-medium">Baths</p>
                      <p className="text-lg font-bold">{property.num_bathrooms || "—"}</p>
                    </div>
                  </div>

                  <Link to={`/properties/${property.id}`} className="w-full mt-6 block">
                    <Button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition h-auto">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/all-properties">
            <Button variant="outline" className="border-2 border-primary text-primary px-10 py-4 rounded-lg font-semibold hover:bg-accent transition h-auto">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
