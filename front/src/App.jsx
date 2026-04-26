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
import { ChevronLeft, ChevronRight, Zap, Shield, Users, Search } from "lucide-react";
import { useProperties } from "@/services/api/useProperties";
import { useMunicipalities } from "@/services/api/useMunicipalities";
import { Link, useNavigate } from "react-router";
import { isUserLoggedIn } from "@/services/api/useAuth";

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
    enabled: true, // always load for search widget
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

      <div className="relative h-screen w-full overflow-hidden pt-[72px]">
        <img
          src="/src/assets/wow.jpg" 
          className="w-full h-full object-cover"
          alt="featured"
        />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white [text-shadow:_0_0_10px_rgba(0,0,0,0.9),_0_0_20px_rgba(0,0,0,0.7),_0_0_30px_rgba(0,0,0,0.5)] max-w-5xl">
            Find Your Perfect Home
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mb-10 text-white/90 [text-shadow:_0_0_8px_rgba(0,0,0,0.9),_0_0_16px_rgba(0,0,0,0.7),_0_0_24px_rgba(0,0,0,0.5)]">
            Discover premium properties tailored to your lifestyle and investment goals
          </p>
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Max Price
                  </Label>
                  <span className="text-sm font-bold text-blue-800">
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
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>₱1M</span>
                  <span>₱50M+</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Location
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full h-11 border-2 border-gray-200 rounded-lg focus:border-blue-700">
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
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Property Type
                </Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full h-11 border-2 border-gray-200 rounded-lg focus:border-blue-700">
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
                className="bg-blue-800 text-white px-16 py-4 rounded-lg font-semibold hover:bg-blue-900 transition shadow-lg h-auto flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Properties
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/all-properties")}
                className="border-2 border-blue-800 text-blue-800 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition h-auto"
              >
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20">
        <Card className="border border-gray-100 hover:shadow-lg transition bg-white">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-blue-800" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Quick Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse through hundreds of verified listings with detailed information and virtual tours
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 hover:shadow-lg transition bg-white">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-amber-900" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Secure Process</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed">
              Complete transparency with verified sellers and secure transactions throughout
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 hover:shadow-lg transition bg-white">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Expert Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed">
              Dedicated agents and specialists ready to assist you every step of the way
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Properties</h2>
          <p className="text-lg text-gray-600">Explore our handpicked selection of premium properties</p>
        </div>

        {loadingProperties && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading properties...</p>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-600 text-lg">Sign in to view available properties.</p>
          </div>
        )}

        {isLoggedIn && !loadingProperties && Array.isArray(properties) && properties.length === 0 && (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-600 text-lg">No properties available at the moment.</p>
          </div>
        )}

        {isLoggedIn && !loadingProperties && Array.isArray(properties) && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {properties.slice(0, 6).map((property, index) => (
              <Card key={property.id} className="overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition duration-300 group">
                <div className="relative h-72 bg-gray-200 overflow-hidden rounded-t-lg">
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
                          alt={`${property.property_name} ${imgIdx + 1}`}
                        />
                      ))
                    ) : (
                      <img
                        src="https://via.placeholder.com/1200x800?text=No+Image+Available"
                        className="flex-shrink-0 w-full h-full object-cover snap-center"
                        alt="No image available"
                      />
                    )}
                  </div>
                  
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                      {property.status}
                    </span>
                  </div>

                  {property.images && property.images.length > 1 && (
                    <>
                      <Button
                        onClick={() => scrollLeft(index)}
                        variant="ghost"
                        size="icon"
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={24} />
                      </Button>
                      <Button
                        onClick={() => scrollRight(index)}
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={24} />
                      </Button>
                    </>
                  )}
                </div>

                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {property.property_name || `Property ${property.id}`}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
                    <span className="font-semibold text-gray-500">Address:</span>
                    <span>{property.property_address || "Not specified"}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Price</span>
                      <span className="text-2xl font-bold text-blue-800">
                        {formatPropertyPrice(property)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs font-medium">Size</p>
                      <p className="text-lg font-bold text-gray-900">{property.property_size || "—"}</p>
                      <p className="text-xs text-gray-500">sqm</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs font-medium">Beds</p>
                      <p className="text-lg font-bold text-gray-900">{property.num_bedrooms || "—"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs font-medium">Baths</p>
                      <p className="text-lg font-bold text-gray-900">{property.num_bathrooms || "—"}</p>
                    </div>
                  </div>

                  <Link to={`/properties/${property.id}`} className="w-full mt-6 block">
                    <Button className="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition h-auto">
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
            <Button variant="outline" className="border-2 border-blue-800 text-blue-800 px-10 py-4 rounded-lg font-semibold hover:bg-blue-50 transition h-auto">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
