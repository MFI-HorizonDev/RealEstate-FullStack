import { useState } from "react";
import { useProperties } from "@/hooks/api/properties/UseGetProperties";
import { isUserLoggedIn } from "@/hooks/api/authentication/useAuth";

export default function TestPagination() {
  const [page, setPage] = useState(1);
  const loggedIn = isUserLoggedIn();
  const { data, isLoading, isError, error, isFetching } = useProperties({
    page,
    enabled: loggedIn,
  });

  const results = data?.results ?? [];
  const hasNext = Boolean(data?.next);
  const hasPrevious = Boolean(data?.previous);

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Test Pagination</h1>
        <p className="text-sm text-slate-600">Please sign in to test paginated backend responses.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Test Pagination</h1>
      <p className="text-sm text-slate-600">
        Page: {page} {isFetching ? "(updating...)" : ""}
      </p>

      {isLoading && <p className="text-sm">Loading...</p>}
      {isError && <p className="text-sm text-red-600">{error?.message}</p>}

      {!isLoading && !isError && (
        <>
          <p className="text-sm">Total count: {data?.count ?? 0}</p>
          <div className="rounded border bg-slate-50 p-3">
            <pre className="overflow-auto text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!hasPrevious}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

