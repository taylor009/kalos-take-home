"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { createTransaction } from "@/lib/api";
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

export function AddTransactionForm({
  onSuccess,
  className,
}: AddTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      customerName: "",
      amount: "",
      currency: "USD",
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate and refetch transactions and analytics
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      reset();
      onSuccess?.();
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const transactionData: CreateTransactionRequest = {
        customerName: data.customerName.trim(),
        amount: parseFloat(data.amount),
        currency: data.currency,
      };

      await createTransactionMutation.mutateAsync(transactionData);
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Add New Transaction
          </h3>
          <p className="text-sm text-gray-500">
            Create a new transaction to track revenue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Customer Name */}
          <Input
            label="Customer Name"
            type="text"
            placeholder="Enter customer name"
            error={errors.customerName?.message}
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
            })}
          />

          {/* Amount */}
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount", {
              required: "Amount is required",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid amount (up to 2 decimal places)",
              },
              validate: (value) => {
                const num = parseFloat(value);
                if (num <= 0) return "Amount must be greater than 0";
                if (num > 1000000) return "Amount must be less than $1,000,000";
                return true;
              },
            })}
          />

          {/* Currency */}
          <div className="space-y-1">
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700"
            >
              Currency
            </label>
            <select
              id="currency"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("currency")}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          {/* Error Display */}
          {createTransactionMutation.isError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Failed to create transaction
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {createTransactionMutation.error instanceof Error
                        ? createTransactionMutation.error.message
                        : "An unexpected error occurred. Please try again."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {createTransactionMutation.isSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Transaction created successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
