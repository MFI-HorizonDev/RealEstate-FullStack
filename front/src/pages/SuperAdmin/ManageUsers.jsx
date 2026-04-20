import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/services/api/apiClient";
import { useAuth } from "@/services/api/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Trash2, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ManageUsers() {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiGet("/admin/users/"),
    enabled: isLoggedIn,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/admin/users/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted.");
    },
    onError: () => toast.error("Failed to delete user."),
  });

  const users = Array.isArray(data) ? data : data?.results ?? [];
  const filtered = users.filter(u =>
    `${u.username} ${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (groups, is_superuser) => {
    if (is_superuser) return "bg-amber-100 text-amber-800 border-amber-200";
    if (groups?.includes("Admin")) return "bg-red-100 text-red-800 border-red-200";
    if (groups?.includes("Agent")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (groups?.includes("Owner")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (groups?.includes("Buyer")) return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 mt-1">View and manage all registered users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: users.length, color: "blue" },
          { label: "Admins", value: users.filter(u => u.groups?.includes("Admin")).length, color: "red" },
          { label: "Agents", value: users.filter(u => u.groups?.includes("Agent")).length, color: "blue" },
          { label: "Owners", value: users.filter(u => u.groups?.includes("Owner")).length, color: "purple" },
          { label: "Buyers", value: users.filter(u => u.groups?.includes("Buyer")).length, color: "green" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-800" /> All Users</CardTitle>
              <CardDescription>{filtered.length} users found</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
          {isError && <p className="text-red-600 text-sm">Failed to load users.</p>}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found.</p>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID", "Name", "Username", "Email", "Role", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.is_superuser && <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />}
                        <span className="font-semibold text-gray-900">{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">@{u.username}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.is_superuser && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">SuperAdmin</Badge>
                        )}
                        {u.groups?.map(g => (
                          <Badge key={g} variant="outline" className={`${roleColor(u.groups, false)} text-[10px]`}>{g}</Badge>
                        ))}
                        {!u.is_superuser && !u.groups?.length && (
                          <Badge variant="outline" className="text-[10px]">No Role</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {!u.is_superuser && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => {
                            if (confirm(`Delete user "${u.username}"?`)) deleteMutation.mutate(u.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      )}
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
