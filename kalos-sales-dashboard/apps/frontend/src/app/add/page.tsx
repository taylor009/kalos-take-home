"use client";

import { useRouter } from "next/navigation";
import { AddTransactionForm } from "@/components/features";
import { SectionErrorBoundary } from "@/components/error-boundary";
import { Breadcrumb } from "@/components/navigation";
import { FormSkeleton } from "@/components/ui";
import { Suspense } from "react";

export default function AddTransactionPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate back to the dashboard after successful creation
    setTimeout(() => {
      router.push("/");
    }, 1500); // Give user time to see success message
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Add Transaction' }
        ]} 
      />

      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
          aria-label="Go back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Transaction
          </h1>
          <p className="mt-1 text-gray-600">
            Create a new transaction record for the sales dashboard.
          </p>
        </div>
      </div>

      {/* Add Transaction Form with Error Boundary */}
      <SectionErrorBoundary>
        <Suspense fallback={<FormSkeleton />}>
          <AddTransactionForm onSuccess={handleSuccess} className="max-w-2xl" />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
