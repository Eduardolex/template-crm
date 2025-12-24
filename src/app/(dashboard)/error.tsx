"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-slate-600">
            We encountered an error while loading this page. This could be due to a
            database connection issue or missing data.
          </p>
          {error.message && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800 font-mono">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          If this problem persists, please check your database connection and ensure
          your tenant data is properly initialized.
        </p>
      </div>
    </div>
  );
}
