import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api/apiClient";
import { useAuth } from "@/services/api/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CheckCircle2, Clock } from "lucide-react";

const peso = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));

export default function AgentCommissions() {
  const { isLoggedIn } = useAuth();
  const { isAdmin } = useContextAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["commissions"],
    queryFn: () => apiGet("/commissions/"),
    enabled: isLoggedIn,
  });

  const commissions = Array.isArray(data) ? data : data?.results ?? [];
  const totalEarned = commissions.filter(c => c.is_paid).reduce((s, c) => s + Number(c.amount_calculated || 0), 0);
  const totalPending = commissions.filter(c => !c.is_paid).reduce((s, c) => s + Number(c.amount_calculated || 0), 0);

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <p className="text-red-600 text-sm">Commissions are visible to admins only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Commissions</h1>
        <p className="text-gray-500 mt-1">Track your earnings from property sales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="w-5 h-5 text-blue-800" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{commissions.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Total</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-700" /></div>
          <div><p className="text-lg font-bold text-gray-900 truncate">{peso(totalEarned)}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Paid</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-700" /></div>
          <div><p className="text-lg font-bold text-gray-900 truncate">{peso(totalPending)}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Records</CardTitle>
          <CardDescription>All commissions from your closed deals</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
          {isError && <p className="text-red-600 text-sm">Failed to load commissions.</p>}
          {!isLoading && commissions.length === 0 && (
            <div className="text-center py-16"><DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No commissions yet.</p></div>
          )}
          <div className="space-y-3">
            {commissions.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-gray-900">Sale #{c.sale}</p>
                  <p className="text-xs text-gray-500">Rate: {c.commission_rate}% • {c.date_paid}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-blue-900">{peso(c.amount_calculated)}</p>
                  <Badge variant="outline" className={c.is_paid ? "bg-green-100 text-green-800 border-green-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                    {c.is_paid ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
