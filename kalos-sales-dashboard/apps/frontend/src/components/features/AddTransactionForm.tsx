"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import { useCreateTransactionMutation } from "@/lib/mutations";
import { cn } from "@/lib/utils";
import type { CreateTransactionRequest } from "@shared";

interface AddTransactionFormProps {
  onSuccess?: () => void;
  className?: string;
}

interface FormData {
  customerName: string;
  amount: string;
  currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD";
}

// Enhanced currency formatting for preview
function formatCurrencyPreview(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function AddTransactionForm({
  onSuccess,
  className,
}: AddTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      customerName: "",
      amount: "",
      currency: "USD",
    },
  });

  const createTransactionMutation = useCreateTransactionMutation();

  // Watch for real-time updates
  const watchedAmount = watch("amount");
  const watchedCurrency = watch("currency");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const transactionData: CreateTransactionRequest = {
        customerName: data.customerName.trim(),
        amount: parseFloat(data.amount),
        currency: data.currency,
      };

      await createTransactionMutation.mutateAsync(transactionData);

      // Success actions
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    createTransactionMutation.reset();
  };

  const previewAmount = formatCurrencyPreview(watchedAmount, watchedCurrency);

  return (
    <div className={className}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Add New Transaction
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Create a new transaction to track revenue and analytics
              </p>
            </div>
          </div>

          {/* Live Preview */}
          {previewAmount && (
            <div className="mt-4 p-4 bg-white/60 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Preview:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {previewAmount}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Customer Name */}
          <div className="space-y-1">
            <Input
              label="Customer Name"
              type="text"
              placeholder="Enter customer name"
              error={errors.customerName?.message}
              helperText="Enter the full name of the customer"
              className={cn(
                "transition-all duration-200",
                errors.customerName && "ring-2 ring-red-500/20"
              )}
              {...register("customerName", {
                required: "Customer name is required",
                minLength: {
                  value: 2,
                  message: "Customer name must be at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Customer name must be less than 100 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\s\-\.\']+$/,
                  message:
                    "Please enter a valid customer name (letters, spaces, hyphens, dots, and apostrophes only)",
                },
              })}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              placeholder="0.00"
              error={errors.amount?.message}
              helperText="Enter the transaction amount (e.g., 100.50)"
              className={cn(
                "transition-all duration-200 font-mono",
                errors.amount && "ring-2 ring-red-500/20"
              )}
              {...register("amount", {
                required: "Amount is required",
                pattern: {
                  value: /^\d*\.?\d{0,2}$/,
                  message:
                    "Please enter a valid amount (up to 2 decimal places)",
                },
                validate: (value) => {
                  const num = parseFloat(value);
                  if (isNaN(num)) return "Please enter a valid number";
                  if (num <= 0) return "Amount must be greater than 0";
                  if (num > 999999.99)
                    return "Amount must be less than $1,000,000";
                  return true;
                },
              })}
            />
          </div>

          {/* Enhanced Currency Selector */}
          <div className="space-y-1">
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                className={cn(
                  "block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 pr-10",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
                  "bg-white text-gray-900 transition-all duration-200",
                  "appearance-none cursor-pointer"
                )}
                {...register("currency")}
              >
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
                <option value="GBP">🇬🇧 GBP - British Pound</option>
                <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
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
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select the currency for this transaction
            </p>
          </div>

          {/* Enhanced Error Display */}
          {createTransactionMutation.isError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-red-800 mb-2">
                    Transaction Creation Failed
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    {createTransactionMutation.error instanceof Error
                      ? createTransactionMutation.error.message
                      : "An unexpected error occurred while creating the transaction. Please check your input and try again."}
                  </p>
                  <button
                    type="button"
                    onClick={() => createTransactionMutation.reset()}
                    className="text-sm font-medium text-red-800 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Success Display */}
          {createTransactionMutation.isSuccess && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-green-800 mb-1">
                    Transaction Created Successfully!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your transaction has been added and analytics have been
                    updated. You should see it appear in the dashboard shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800 mb-1">
                    Please fix the following errors:
                  </h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">•</span>
                        {error?.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isSubmitting}
              className="sm:order-1"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Form
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !isValid || !isDirty}
              className="sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Transaction...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Transaction
                </>
              )}
            </Button>
          </div>

          {/* Form Status Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isDirty ? "bg-blue-500" : "bg-gray-300"
                  )}
                ></div>
                <span>Form {isDirty ? &quot;Modified&quot; : &quot;Clean&quot;}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isValid ? "bg-green-500" : "bg-amber-500"
                  )}
                ></div>
                <span>Validation {isValid ? &quot;Passed&quot; : &quot;Pending&quot;}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
