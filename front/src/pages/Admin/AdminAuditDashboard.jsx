import { useMemo } from "react";
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

function peso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AdminAuditDashboard() {
  const token = localStorage.getItem("access");
  const { data = [], isLoading, isError } = useFlaggedListings(token);
  const approveMutation = useApproveListing(token);
  const rejectMutation = useRejectListing(token);

  const columns = useMemo(
    () => [
      {
        accessorKey: "property_name",
        header: "Property Name",
        cell: ({ row }) => (
          <span className="font-medium text-slate-900">{row.original.property_name}</span>
        ),
      },
      {
        accessorKey: "agent",
        header: "Agent Name",
        cell: ({ row }) => (
          <span className="text-slate-700">{row.original.agent || "Unassigned"}</span>
        ),
      },
      {
        accessorKey: "price",
        header: "Requested Price (₱)",
        cell: ({ row }) => <span>{peso(row.original.price)}</span>,
      },
      {
        accessorKey: "engineBasePrice",
        header: "Engine Base Price (₱)",
        cell: ({ row }) => <span>{peso(row.original.engineBasePrice)}</span>,
      },
      {
        accessorKey: "deviation",
        header: "Deviation (%)",
        cell: ({ row }) => {
          const val = Number(row.original.deviation || 0);
          const isHigh = Math.abs(val) > 15;
          return (
            <span className={isHigh ? "font-bold text-red-600" : "text-slate-700"}>
              {val.toFixed(2)}%
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(row.original.id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => rejectMutation.mutate(row.original.id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ],
    [approveMutation, rejectMutation]
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
      <Card>
        <CardHeader>
          <CardTitle>Pending Security Reviews</CardTitle>
          <CardDescription>
            Listings auto-flagged by pricing rules for admin verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-slate-500">Loading flagged listings...</p>}
          {isError && <p className="text-sm text-red-600">Failed to load flagged listings.</p>}

          {!isLoading && !isError && (
            <>
              <div className="overflow-x-auto rounded-md border">
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
                        <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                          No flagged listings found.
                        </td>
                      </tr>
                    )}

                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

