"use client";

import { useRouter } from "next/navigation";
import { AddTransactionForm } from "@/components/features";

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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Add New Transaction
        </h1>
        <p className="mt-2 text-gray-600">
          Create a new transaction record for the sales dashboard.
        </p>
      </div>

      {/* Add Transaction Form */}
      <AddTransactionForm onSuccess={handleSuccess} className="max-w-2xl" />

      {/* Back Link */}
      <div className="max-w-2xl">
        <a
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-4 h-4 mr-1"
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
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
