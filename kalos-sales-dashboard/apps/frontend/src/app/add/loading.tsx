import { FormSkeleton } from "@/components/ui";

export default function AddTransactionLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-1">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        <span className="text-gray-400">/</span>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Header skeleton */}
      <div className="flex items-center space-x-4">
        <div className="w-9 h-9 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Form skeleton */}
      <FormSkeleton />
    </div>
  );
}
