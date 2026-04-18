import { useState } from "react";
import { useProperties } from "@/services/api/useProperties";

export default function TestPagination() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error } = useProperties(page);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Test Pagination</h1>
      <p className="text-sm text-slate-600">
        Current page: <span className="font-semibold">{page}</span>{" "}
        {isFetching ? "(updating...)" : ""}
      </p>

      {isLoading && <p>Loading properties...</p>}
      {isError && <p className="text-red-600">{error?.message || "Failed to load."}</p>}

      {data && (
        <>
          <pre className="overflow-auto rounded-md border bg-slate-50 p-4 text-xs">
            {JSON.stringify(data.results, null, 2)}
          </pre>

          <div className="text-sm text-slate-700">
            <p>Total count: {data.count}</p>
            <p>Next: {String(data.next)}</p>
            <p>Previous: {String(data.previous)}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!data.previous}
              className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!data.next}
              className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

