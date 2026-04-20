import React, { useRef } from "react";
import { CardTitle } from "@/components/ui/card";
import {
  CircleUserRound,
  House,
  KeyRound,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProperties } from "@/services/api/useProperties";
import { useTours } from "@/services/api/useTours";
import { useMunicipalities } from "@/services/api/useMunicipalities";
import { useSales } from "@/services/api/useSales";
import { useAuth } from "@/services/api/useAuth";

const Home = () => {
  const carouselRefs = useRef([]);
  const { isLoggedIn } = useAuth();


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
  const { data: tours = [], isLoading: loadingTours } = useTours({ enabled: isLoggedIn });
  const { data: municipalities = [], isLoading: loadingMunicipalities } = useMunicipalities({ enabled: isLoggedIn });
  const { data: bookings = [], isLoading: loadingBookings } = useSales({ enabled: isLoggedIn });

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

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden -mt-28">
        <img
          src="/src/assets/wow.jpg"
          className="w-full h-full object-cover"
          alt="featured"
        />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white [text-shadow:_0_0_10px_rgba(0,0,0,0.9),_0_0_20px_rgba(0,0,0,0.7),_0_0_30px_rgba(0,0,0,0.5)]">
            Real Estate ng Horizon Dev
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mb-8 text-white [text-shadow:_0_0_8px_rgba(0,0,0,0.9),_0_0_16px_rgba(0,0,0,0.7),_0_0_24px_rgba(0,0,0,0.5)]">
            dito description sa susunod nalang lagyan boss
          </p>
          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <input
                  type="range"
                  min="0"
                  max="1500000"
                  defaultValue="750000"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>₱0</span>
                  <span>₱1,500,000</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white">
                  <option>Any</option>
                  {municipalities?.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.municipality_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white">
                  <option>Any</option>
                  <option>For Sale</option>
                  <option>For Rent</option>
                  <option>Investment</option>
                </select>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button className="bg-blue-800 text-white px-12 py-4 rounded-lg font-medium hover:bg-blue-900 transition text-lg shadow-md">
                Search Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 mt-12 md:mt-16 mb-16">
        <div className="text-center p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition">
          <House className="h-20 w-20 mx-auto mb-4 text-blue-800" />
          <h3 className="text-xl font-semibold mb-3">Hundreds of Listings</h3>
          <p className="text-gray-700 text-sm md:text-base">
            dito description sa susunod nalang lagyan boss
          </p>
        </div>
        <div className="text-center p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition">
          <KeyRound className="h-20 w-20 mx-auto mb-4 text-amber-900" />
          <h3 className="text-xl font-semibold mb-3">Relocation Support</h3>
          <p className="text-gray-700 text-sm md:text-base">
            dito description sa susunod nalang lagyan boss
          </p>
        </div>
        <div className="text-center p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition">
          <Search className="h-20 w-20 mx-auto mb-4 text-blue-800" />
          <h3 className="text-xl font-semibold mb-3">Dedicated Conciergess</h3>
          <p className="text-gray-700 text-sm md:text-base">
            dito description sa susunod nalang lagyan boss
          </p>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 md:py-16">
        <CardTitle className="text-center font-bold text-3xl mb-8 text-blue-800">
          Featured Properties
        </CardTitle>

        {loadingProperties && <p className="text-center text-gray-600">Loading properties...</p>}

        {properties && properties.length === 0 && !loadingProperties && (
          <p className="text-center text-gray-600">No properties available.</p>
        )}

        {Array.isArray(properties) && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {properties.slice(0, 3).map((property, index) => (
              <div key={property.id} className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                  <div className="w-full h-[340px] md:h-[420px] bg-gray-300 rounded-2xl overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].image}
                        className="w-full h-full object-cover"
                        alt={property.property_name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mt-4">
                  {property.property_name || `Property ${property.id}`}
                </h3>
                <p className="text-gray-600 text-center text-sm">
                  ₱{property.price?.toLocaleString()} • {property.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
