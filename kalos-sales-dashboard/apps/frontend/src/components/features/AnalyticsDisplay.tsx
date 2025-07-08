"use client";

import { useState, useEffect, useRef } from "react";
import type { Analytics } from "@shared";
import { cn } from "@/lib/utils";

interface AnalyticsDisplayProps {
  analytics: Analytics | undefined;
  isLoading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  isUpdated?: boolean;
  hasIncrease?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  isLoading,
  isUpdated,
  hasIncrease,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow p-6 transition-all duration-500 ease-in-out",
        isUpdated &&
          "ring-2 ring-green-400 ring-opacity-50 bg-green-50 scale-[1.02]",
        hasIncrease && "bg-gradient-to-br from-green-50 to-white"
      )}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-8 h-8 transition-colors duration-300",
              isUpdated ? "text-green-600" : "text-blue-600"
            )}
          >
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt
            className={cn(
              "text-sm font-medium truncate transition-colors duration-300",
              isUpdated ? "text-green-700" : "text-gray-500"
            )}
          >
            {title}
            {isUpdated && (
              <span className="ml-2 inline-flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </span>
            )}
          </dt>
          <dd
            className={cn(
              "text-2xl font-semibold transition-all duration-300",
              isUpdated ? "text-green-900" : "text-gray-900",
              hasIncrease && "animate-pulse"
            )}
          >
            {value}
            {hasIncrease && (
              <span className="ml-2 inline-flex items-center text-sm font-medium text-green-600">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </dd>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDisplay({
  analytics,
  isLoading,
  className,
}: AnalyticsDisplayProps) {
  const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
  const [revenueIncreased, setRevenueIncreased] = useState(false);
  const [countIncreased, setCountIncreased] = useState(false);
  const prevAnalyticsRef = useRef<Analytics | undefined>(undefined);

  // Detect analytics updates and add visual indicators
  useEffect(() => {
    const prevAnalytics = prevAnalyticsRef.current;

    if (prevAnalytics && analytics) {
      const updatedFieldsSet = new Set<string>();

      // Check for revenue changes
      if (prevAnalytics.totalRevenue !== analytics.totalRevenue) {
        updatedFieldsSet.add("revenue");
        setRevenueIncreased(
          analytics.totalRevenue > prevAnalytics.totalRevenue
        );
        console.log("💰 Analytics: Revenue updated", {
          from: prevAnalytics.totalRevenue,
          to: analytics.totalRevenue,
          increased: analytics.totalRevenue > prevAnalytics.totalRevenue,
        });
      }

      // Check for transaction count changes
      if (prevAnalytics.transactionCount !== analytics.transactionCount) {
        updatedFieldsSet.add("count");
        setCountIncreased(
          analytics.transactionCount > prevAnalytics.transactionCount
        );
        console.log("📊 Analytics: Transaction count updated", {
          from: prevAnalytics.transactionCount,
          to: analytics.transactionCount,
          increased:
            analytics.transactionCount > prevAnalytics.transactionCount,
        });
      }

      if (updatedFieldsSet.size > 0) {
        setUpdatedFields(updatedFieldsSet);

        // Clear indicators after animation
        setTimeout(() => {
          setUpdatedFields(new Set());
          setRevenueIncreased(false);
          setCountIncreased(false);
        }, 3000);
      }
    }

    // Update ref for next comparison
    prevAnalyticsRef.current = analytics;
  }, [analytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateAverageTransaction = () => {
    if (!analytics || analytics.transactionCount === 0) return "$0.00";
    const average = analytics.totalRevenue / analytics.transactionCount;
    return formatCurrency(average);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={isLoading ? "-" : formatCurrency(analytics?.totalRevenue || 0)}
          isLoading={isLoading}
          isUpdated={updatedFields.has("revenue")}
          hasIncrease={revenueIncreased}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />

        <StatCard
          title="Transaction Count"
          value={
            isLoading ? "-" : analytics?.transactionCount.toString() || "0"
          }
          isLoading={isLoading}
          isUpdated={updatedFields.has("count")}
          hasIncrease={countIncreased}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          }
        />

        <StatCard
          title="Average Transaction"
          value={isLoading ? "-" : calculateAverageTransaction()}
          isLoading={isLoading}
          isUpdated={updatedFields.has("revenue") || updatedFields.has("count")}
          hasIncrease={revenueIncreased || countIncreased}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
