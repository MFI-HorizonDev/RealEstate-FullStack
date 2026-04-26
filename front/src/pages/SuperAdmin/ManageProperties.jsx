import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete, apiPatch } from "@/hooks/api/apiClient";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Building2, Trash2, Search, CheckCircle2, XCircle } from "lucide-react";
import { notify } from "@/lib/notifications";

const peso = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  REJECTED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  SOLD: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  INACTIVE: "bg-muted text-muted-foreground border-border",
};

export default function ManageProperties() {
  const { isLoggedIn } = useAuth();
  const { isAdmin } = useContextAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => apiGet("/admin/properties/"),
    enabled: isLoggedIn,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/admin/properties/${id}/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-properties"] }); notify.success("Property deleted."); },
    onError: () => notify.error("Failed to delete property."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/properties/${id}/admin-status/`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-properties"] }); notify.success("Status updated."); },
    onError: () => notify.error("Failed to update status."),
  });

  const properties = Array.isArray(data) ? data : data?.results ?? [];
  const filtered = properties.filter(p =>
    `${p.property_name} ${p.property_address}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Properties</h1>
        <p className="text-muted-foreground mt-1">Full control over all property listings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: properties.length },
          { label: "Active", value: properties.filter(p => p.status === "ACTIVE").length },
          { label: "Under Review", value: properties.filter(p => p.status === "UNDER_REVIEW").length },
          { label: "Rejected", value: properties.filter(p => p.status === "REJECTED").length },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> All Properties</CardTitle>
              <CardDescription>{filtered.length} properties found</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
          {isError && <p className="text-destructive text-sm">Failed to load properties.</p>}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No properties found.</p>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {["ID", "Name", "Municipality", "Price", "Type", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">#{p.id}</td>
                    <td className="px-4 py-3 font-semibold text-foreground max-w-[160px] truncate">{p.property_name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.property_municipality?.municipality_name || "—"}</td>
                    <td className="px-4 py-3 font-bold text-primary text-xs">{p.price ? peso(p.price) : "TBD"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.type}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${STATUS_COLORS[p.status] || "bg-muted text-muted-foreground"} text-[10px] font-bold`}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isAdmin && p.status === "UNDER_REVIEW" && (
                          <>
                            <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                              onClick={() => statusMutation.mutate({ id: p.id, status: "ACTIVE" })}
                              disabled={statusMutation.isPending}>
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs gap-1"
                              onClick={() => statusMutation.mutate({ id: p.id, status: "REJECTED" })}
                              disabled={statusMutation.isPending}>
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                        {isAdmin && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-500 border-red-300 hover:bg-red-500/10 gap-1"
                            onClick={() => { if (confirm(`Delete "${p.property_name}"?`)) deleteMutation.mutate(p.id); }}
                            disabled={deleteMutation.isPending}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
