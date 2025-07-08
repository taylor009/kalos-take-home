import { AnalyticsGridSkeleton, TableSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Analytics Grid skeleton */}
      <AnalyticsGridSkeleton />

      {/* Transactions Table skeleton */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <TableSkeleton rows={5} columns={4} />
        </div>
      </div>
    </div>
  );
}
