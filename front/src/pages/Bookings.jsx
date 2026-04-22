import React from "react";
import { Link } from "react-router";
import { useSales } from "@/services/api/useSales";
import { useAuth } from "@/services/api/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ExternalLink, ArrowRight } from "lucide-react";

export default function Bookings() {
  const { user, isLoggedIn, isLoading: loadingAuth, isError, error } = useAuth();
  const { data: bookings = [], isLoading: loadingSales } = useSales({ enabled: isLoggedIn });

  const isLoading = loadingAuth || loadingSales;

  if (!isLoggedIn) {

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
        <p className="text-gray-500">Please log in to view your bookings.</p>
      </div>
    );
  }

  const formatPeso = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
      APPROVED: "bg-blue-100 text-blue-800 border-blue-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Property Bookings</h1>
          <p className="text-gray-500">View property sales and booking records</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 mb-8">
          Failed to load bookings: {error?.message || "Unknown error"}
        </div>
      )}

      {Array.isArray(bookings) && bookings.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No bookings yet</h3>
          <p className="text-gray-500 mt-1">Your property sales records will appear here.</p>
        </div>
      )}

      {Array.isArray(bookings) && bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white flex flex-col">
              <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`${getStatusColor(booking.approval_status)} font-semibold`}>
                    {booking.approval_status}
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium">Sale #{booking.id}</span>
                </div>
                <CardTitle className="text-xl text-gray-900 truncate">
                  {booking.property?.property_name || `Property #${booking.property?.id ?? booking.property}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Final Price</p>
                    <p className="text-xl font-bold text-blue-900">{formatPeso(booking.final_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">List Price</p>
                    <p className="text-lg font-medium text-gray-700">{formatPeso(booking.property?.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buyer ID</p>
                    <p className="text-gray-900 font-medium">{booking.buyer ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Sold</p>
                    <p className="text-gray-900 font-medium">{booking.date_sold || "N/A"}</p>
                  </div>
                </div>

                {booking.admin_notes && (
                  <div className="mt-6 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong className="text-blue-900">Notes:</strong> {booking.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
                <Link to={`/properties/${booking.property?.id ?? booking.property}`} className="w-full">
                  <Button variant="outline" className="w-full bg-white border-gray-200 hover:bg-gray-50 hover:text-blue-800 text-gray-700 transition-colors">
                    View Property Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {Array.isArray(bookings) && bookings.length > 0 && (
        <Card className="relative bg-blue-900 text-white border-0 shadow-xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[url('/src/assets/wow.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-white text-xl">Bookings Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
            <div>
              <p className="text-4xl font-bold text-white mb-1">{bookings.length}</p>
              <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Total Sales</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-300 mb-1">
                {bookings.filter((b) => b.approval_status === "PENDING_REVIEW").length}
              </p>
              <p className="text-sm text-amber-100 font-medium uppercase tracking-wider">Pending</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-300 mb-1">
                {bookings.filter((b) => b.approval_status === "APPROVED").length}
              </p>
              <p className="text-sm text-blue-100 font-medium uppercase tracking-wider">Approved</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400 mb-1">
                {bookings.filter((b) => b.approval_status === "COMPLETED").length}
              </p>
              <p className="text-sm text-green-100 font-medium uppercase tracking-wider">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-200 mb-2 truncate">
                {formatPeso(bookings.reduce((sum, b) => sum + Number(b.final_price || 0), 0))}
              </p>
              <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Total Value</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
