import React from "react";
import { useMunicipalities } from "@/services/api/useMunicipalities";
import { isUserLoggedIn } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, TrendingUp } from "lucide-react";

function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function Places() {
  const isLoggedIn = isUserLoggedIn();
  const { data: municipalities = [], isLoading, isError, error } = useMunicipalities({
    enabled: isLoggedIn,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[88px]">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Available Locations</h1>
        </div>
        <p className="text-gray-500 text-lg">Browse municipalities and their baseline price-per-sqm valuation data.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 mb-8">
          Failed to load locations: {error?.message || "Unknown error"}
        </div>
      )}

      {Array.isArray(municipalities) && municipalities.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No municipalities found</h3>
          <p className="text-gray-500 mt-1">Location data will appear here once seeded.</p>
        </div>
      )}

      {Array.isArray(municipalities) && municipalities.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {municipalities.map((municipality) => (
              <Card key={municipality.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200 bg-white overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 group-hover:text-blue-800 transition">
                        {municipality.municipality_name}
                      </CardTitle>
                      <CardDescription>Price baseline for property valuation</CardDescription>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center ml-4">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Price per sqm</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {formatPeso(municipality.price_per_sqm)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-900 text-white border-0 shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white text-xl">Locations Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-4xl font-bold text-white mb-2">{municipalities.length}</p>
                <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Total Municipalities</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-300 mb-2">
                  {formatPeso(
                    municipalities.reduce((sum, m) => sum + Number(m.price_per_sqm || 0), 0) / municipalities.length
                  )}
                </p>
                <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Avg. Price / sqm</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-400 mb-2">
                  {formatPeso(Math.max(...municipalities.map(m => Number(m.price_per_sqm || 0))))}
                </p>
                <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Highest Price / sqm</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
