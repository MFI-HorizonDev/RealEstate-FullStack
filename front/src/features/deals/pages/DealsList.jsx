import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSales, useGetPendingSales } from "@/features/deals/hooks/useDeals";
import { LoadingSpinner, EmptyState } from "@/shared/components/LoadingAndErrorStates";
import { TrendingUp, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * DealsList - Display sales and deals
 */
export default function DealsList() {
  const navigate = useNavigate();
  const { data: salesData, isLoading: salesLoading } = useGetSales();
  const { data: pendingSalesData, isLoading: pendingLoading } = useGetPendingSales();

  const sales = Array.isArray(salesData?.results)
    ? salesData.results
    : Array.isArray(salesData)
      ? salesData
      : [];

  const pendingSales = Array.isArray(pendingSalesData?.results)
    ? pendingSalesData.results
    : Array.isArray(pendingSalesData)
      ? pendingSalesData
      : [];

  const allDeals = [...sales, ...pendingSales];

  if (salesLoading || pendingLoading) {
    return <LoadingSpinner message="Loading deals..." />;
  }

  if (allDeals.length === 0) {
    return (
      <EmptyState
        title="No Deals Found"
        description="No completed or pending sales transactions."
        icon={TrendingUp}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
        <p className="text-gray-600 mt-1">
          Total: {sales.length} completed, {pendingSales.length} pending
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Completed Sales */}
        {sales.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-green-700">Completed Sales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sales.map((sale) => (
                <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2">
                      {sale.property?.property_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {sale.property?.property_municipality?.municipality_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-600" />
                        <div>
                          <div className="text-sm text-gray-600">Final Price</div>
                          <div className="text-xl font-bold">
                            ₱{sale.final_price?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Sold Date</div>
                        <div className="font-semibold">
                          {new Date(sale.date_sold).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/dashboard/deals/${sale.id}`)}
                    >
                      View Deal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending Sales */}
        {pendingSales.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-yellow-700">Pending Review</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSales.map((sale) => (
                <Card key={sale.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2">
                      {sale.property?.property_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {sale.property?.property_municipality?.municipality_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-yellow-600" />
                        <div>
                          <div className="text-sm text-gray-600">Proposed Price</div>
                          <div className="text-xl font-bold">
                            ₱{sale.final_price?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="font-semibold text-yellow-700">{sale.status}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/dashboard/deals/${sale.id}`)}
                    >
                      View Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
