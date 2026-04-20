import React from "react";
import { Link } from "react-router";
import { useTours } from "@/services/api/useTours";
import { useSales } from "@/services/api/useSales";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Building2, CalendarCheck, MapPin, Search } from "lucide-react";

const peso = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));

export default function BuyerDashboard() {
  const { isLoggedIn } = useAuth();
  const { data: tours = [], isLoading: loadingTours } = useTours({ enabled: isLoggedIn });
  const { data: bookings = [], isLoading: loadingBookings } = useSales({ enabled: isLoggedIn });

  const tourStatusColor = { SCHEDULED: "bg-green-100 text-green-800", QUEUED: "bg-amber-100 text-amber-800", COMPLETED: "bg-blue-100 text-blue-800", REJECTED: "bg-red-100 text-red-800" };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your tours and property bookings.</p>
        </div>
        <Link to="/all-properties">
          <Button className="bg-blue-800 hover:bg-blue-900 text-white gap-2">
            <Search className="w-4 h-4" /> Browse Properties
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tours", value: tours.length, icon: CalendarDays, color: "blue" },
          { label: "Scheduled", value: tours.filter(t => t.status === "SCHEDULED").length, icon: CalendarCheck, color: "green" },
          { label: "Queued", value: tours.filter(t => t.status === "QUEUED").length, icon: CalendarDays, color: "amber" },
          { label: "Bookings", value: bookings.length, icon: Building2, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-50 rounded-lg`}><Icon className={`w-5 h-5 text-${color}-700`} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Tours</CardTitle>
              <CardDescription>Your scheduled property viewings</CardDescription>
            </div>
            <Link to="/tours"><Button variant="outline" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            {loadingTours && <Skeleton className="h-20 w-full" />}
            {!loadingTours && tours.length === 0 && (
              <div className="text-center py-10">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">No tours booked yet.</p>
                <Link to="/all-properties"><Button size="sm" className="bg-blue-800 text-white">Find a Property</Button></Link>
              </div>
            )}
            <div className="space-y-3">
              {tours.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.property_details?.property_name || `Property #${t.property}`}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{t.property_details?.property_address || "—"}</span>
                    </div>
                  </div>
                  <Badge className={`${tourStatusColor[t.status] || "bg-gray-100 text-gray-700"} text-[10px] font-bold border-0`}>{t.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Your property purchase records</CardDescription>
            </div>
            <Link to="/bookings"><Button variant="outline" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            {loadingBookings && <Skeleton className="h-20 w-full" />}
            {!loadingBookings && bookings.length === 0 && (
              <div className="text-center py-10">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No bookings yet.</p>
              </div>
            )}
            <div className="space-y-3">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{b.property?.property_name || `Property #${b.property}`}</p>
                    <p className="text-xs text-gray-500">{b.date_sold || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-900 text-sm">{peso(b.final_price)}</p>
                    <Badge variant="outline" className="text-[10px]">{b.approval_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
