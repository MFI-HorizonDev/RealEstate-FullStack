import React from "react";
import { Link } from "react-router";
import { useProperties } from "@/hooks/api/properties/UseGetProperties";
import { useSales } from "@/hooks/api/sales/useSales";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, DollarSign, PlusCircle, TrendingUp, House, MapPin } from "lucide-react";
import { BASE_URL } from "@/hooks/api/config";

const peso = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));
const IMAGE_PLACEHOLDER = `${BASE_URL}/media/propertyimg/default.jpg`;

function resolveImageSrc(imageValue) {
  if (typeof imageValue !== "string" || !imageValue.trim()) return IMAGE_PLACEHOLDER;
  if (imageValue.startsWith("http")) return imageValue;
  if (imageValue.startsWith("/")) return `${BASE_URL}${imageValue}`;
  return imageValue;
}

function StatusBadge({ status }) {
  const colors = {
    ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
    UNDER_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
    SOLD: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };
  return <Badge variant="outline" className={`${colors[status] || "bg-muted text-muted-foreground"} text-xs font-semibold`}>{status}</Badge>;
}

export default function OwnerDashboard() {
  const { user, isLoggedIn } = useAuth();
  const { isAgent, isOwner, isAdmin } = useContextAuth();
  const { data, isLoading: loadingProps } = useProperties({ page: 1, enabled: isLoggedIn });
  const { data: sales = [], isLoading: loadingSales } = useSales({ enabled: isLoggedIn });

  const properties = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  const myProperties = properties.filter(p => p.owner_id === user?.id || p.owner === user?.username);

  const stats = {
    total: myProperties.length,
    active: myProperties.filter(p => p.status === "ACTIVE").length,
    pending: myProperties.filter(p => p.status === "UNDER_REVIEW").length,
    totalValue: myProperties.reduce((s, p) => s + Number(p.price || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings and sales.</p>
        </div>
        {(isAgent || isOwner || isAdmin) && (
          <Link to="/properties/create">
            <Button className="bg-primary hover:opacity-90 text-primary-foreground gap-2">
              <PlusCircle className="w-4 h-4" /> New Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Listings", value: stats.total, icon: Building2, color: "blue" },
          { label: "Active", value: stats.active, icon: House, color: "green" },
          { label: "Pending Review", value: stats.pending, icon: TrendingUp, color: "amber" },
          { label: "Portfolio Value", value: `₱${(stats.totalValue / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-500/10 rounded-lg`}><Icon className={`w-5 h-5 text-${color}-600`} /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Listings */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>Properties you own</CardDescription>
          </div>
          <Link to="/owner/listings"><Button variant="outline" size="sm">Manage All</Button></Link>
        </CardHeader>
        <CardContent>
          {loadingProps && <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>}
          {!loadingProps && myProperties.length === 0 && (
            <div className="text-center py-12">
              <House className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
              {(isAgent || isOwner || isAdmin) && (
                <Link to="/properties/create"><Button className="bg-primary text-primary-foreground">Create Your First Listing</Button></Link>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProperties.slice(0, 6).map(p => (
              <Link to={`/properties/${p.id}`} key={p.id}>
                <Card className="hover:shadow-md transition-shadow border border-border overflow-hidden">
                  <div className="h-36 bg-muted overflow-hidden">
                    {p.images?.length > 0
                      ? <img src={resolveImageSrc(p.images?.[0]?.image)} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_PLACEHOLDER; }} alt={p.property_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><House className="w-8 h-8 text-muted" /></div>}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{p.property_name}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /><span className="truncate">{p.property_address}</span></div>
                    <p className="font-bold text-primary text-sm">{p.price ? peso(p.price) : "TBD"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Sales records for your properties</CardDescription>
          </div>
          <Link to="/bookings"><Button variant="outline" size="sm">View All</Button></Link>
        </CardHeader>
        <CardContent>
          {loadingSales && <Skeleton className="h-20 w-full" />}
          {!loadingSales && sales.length === 0 && <p className="text-muted-foreground text-sm py-6 text-center">No sales records yet.</p>}
          <div className="space-y-3">
            {sales.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-sm text-foreground">{s.property?.property_name || `Property #${s.property}`}</p>
                  <p className="text-xs text-muted-foreground">{s.date_sold}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">{peso(s.final_price)}</p>
                  <Badge variant="outline" className="text-[10px]">{s.approval_status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
