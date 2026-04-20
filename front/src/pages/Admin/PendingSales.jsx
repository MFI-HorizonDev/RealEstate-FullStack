import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/services/api/apiClient";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const peso = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(v || 0));

export default function PendingSales() {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: ["pending-sales"],
    queryFn: () => apiGet("/pending-sales/"),
    enabled: isLoggedIn,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => apiPatch(`/pending-sales/${id}/update/`, { status: "APPROVED" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pending-sales"] }); toast.success("Sale request approved."); },
    onError: () => toast.error("Failed to approve."),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiPatch(`/pending-sales/${id}/update/`, { status: "REJECTED" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pending-sales"] }); toast.success("Sale request rejected."); },
    onError: () => toast.error("Failed to reject."),
  });

  const list = Array.isArray(requests) ? requests : requests?.results ?? [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Sale Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve or reject flagged sale requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-800" /> Requests</CardTitle>
          <CardDescription>Sales that require admin approval due to unusual pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}
          {isError && <p className="text-red-600 text-sm">Failed to load pending sales.</p>}
          {!isLoading && list.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending sale requests.</p>
            </div>
          )}
          <div className="space-y-4">
            {list.map(req => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{req.property?.property_name || `Property #${req.property}`}</p>
                    <Badge variant="outline" className="text-[10px]">{req.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{req.reason_for_review}</p>
                  <p className="text-sm font-bold text-blue-900">{peso(req.final_price)}</p>
                </div>
                {req.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"
                      onClick={() => approveMutation.mutate(req.id)} disabled={approveMutation.isPending}>
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1"
                      onClick={() => rejectMutation.mutate(req.id)} disabled={rejectMutation.isPending}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
