import React, { useMemo, useCallback, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useApproveListing,
  useFlaggedListings,
  useRejectListing,
} from "@/services/api/adminAuditHooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function peso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AdminAuditDashboard() {
  const [activeTab, setActiveTab] = useState("UNDER_REVIEW");
  const token = localStorage.getItem("access");
  const { data = [], isLoading, isError } = useFlaggedListings(token, activeTab);
  
  const approveMutation = useApproveListing(token);
  const rejectMutation = useRejectListing(token);

  const handleApprove = useCallback((id, name) => {
    const toastId = toast.loading(`Approving ${name}...`);
    approveMutation.mutate(id, {
      onSuccess: () => toast.success(`Property "${name}" has been approved.`, { id: toastId }),
      onError: (err) => toast.error(`Failed to approve: ${err.message}`, { id: toastId })
    });
  }, [approveMutation]);

  const handleReject = useCallback((id, name) => {
    const toastId = toast.loading(`Rejecting ${name}...`);
    rejectMutation.mutate(id, {
      onSuccess: () => toast.success(`Property "${name}" has been rejected.`, { id: toastId }),
      onError: (err) => toast.error(`Failed to reject: ${err.message}`, { id: toastId })
    });
  }, [rejectMutation]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "property_name",
        header: "Property Name",
        cell: ({ row }) => (
          <a 
            href={`/properties/${row.original.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline"
          >
            {row.original.property_name}
          </a>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let color = "bg-gray-100 text-gray-700";
          if (status === "ACTIVE") color = "bg-green-100 text-green-700";
          if (status === "REJECTED") color = "bg-red-100 text-red-700";
          if (status === "UNDER_REVIEW") color = "bg-amber-100 text-amber-700";
          return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>{status}</span>;
        }
      },
      {
        accessorKey: "agent",
        header: "Agent Name",
        cell: ({ row }) => {
          const agent = row.original.agent_details;
          return (
            <span className="text-slate-700">
              {agent ? `${agent.first_name} ${agent.last_name}` : "Unassigned"}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price (₱)",
        cell: ({ row }) => <span className="font-semibold">{peso(row.original.price)}</span>,
      },
      {
        accessorKey: "deviation",
        header: "Deviation",
        cell: ({ row }) => {
          const val = Number(row.original.deviation || 0);
          const isHigh = Math.abs(val) > 15;
          return (
            <span className={isHigh ? "font-bold text-red-600" : "text-green-600 font-medium"}>
              {val > 0 ? "+" : ""}{val.toFixed(2)}%
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (row.original.status !== "UNDER_REVIEW") return <span className="text-gray-400 text-xs italic">No actions</span>;
          
          const isProcessing = approveMutation.isPending || rejectMutation.isPending;
          const currentId = row.original.id;

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApprove(currentId, row.original.property_name)}
                disabled={isProcessing}
              >
                {approveMutation.isPending && approveMutation.variables === currentId ? "..." : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(currentId, row.original.property_name)}
                disabled={isProcessing}
              >
                {rejectMutation.isPending && rejectMutation.variables === currentId ? "..." : "Reject"}
              </Button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject, approveMutation.isPending, rejectMutation.isPending, approveMutation.variables, rejectMutation.variables]
  );

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Audit Dashboard</h1>
        <p className="text-gray-500">Manage property listings and security flags.</p>
      </div>

      <Tabs defaultValue="UNDER_REVIEW" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="UNDER_REVIEW">Pending Review</TabsTrigger>
          <TabsTrigger value="ACTIVE">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "UNDER_REVIEW" ? "Pending Security Reviews" : 
               activeTab === "ACTIVE" ? "Approved Listings" : "Rejected Listings"}
            </CardTitle>
            <CardDescription>
              {activeTab === "UNDER_REVIEW" ? "Listings auto-flagged by pricing rules for admin verification." :
               activeTab === "ACTIVE" ? "Listings that have been approved for public display." :
               "Listings that have been rejected and hidden from the public."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
                <p className="text-sm text-slate-500 font-medium">Loading listings...</p>
              </div>
            )}
            
            {isError && (
              <div className="text-center py-20 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-red-600 font-semibold italic">Failed to load listings. Please try again.</p>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                <div className="overflow-x-auto rounded-md border border-gray-100 shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b">
                          {headerGroup.headers.map((header) => (
                            <th key={header.id} className="px-4 py-3 text-left font-semibold text-slate-700">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.length === 0 && (
                        <tr>
                          <td colSpan={columns.length} className="px-4 py-20 text-center text-slate-400 italic">
                            No listings found for this category.
                          </td>
                        </tr>
                      )}

                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-b hover:bg-slate-50/50 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-4 align-middle">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium tracking-tight">
                    Showing <span className="font-bold text-gray-900">{table.getRowModel().rows.length}</span> results • Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-4 h-9 rounded-lg"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-4 h-9 rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
