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
  trend?: number;
  description?: string;
}

// Enhanced currency formatter with locale support
function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Enhanced number formatter
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  }
  return new Intl.NumberFormat("en-US").format(num);
}

function StatCard({
  title,
  value,
  icon,
  isLoading,
  isUpdated,
  hasIncrease,
  trend,
  description,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-500 ease-in-out overflow-hidden",
        isUpdated &&
          "ring-2 ring-green-400/50 bg-gradient-to-br from-green-50/80 to-white/80 scale-[1.02] shadow-lg",
        hasIncrease &&
          "bg-gradient-to-br from-green-50/60 via-white/80 to-blue-50/60"
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Update indicator */}
      {isUpdated && (
        <div className="absolute top-3 right-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
              isUpdated
                ? "bg-green-100 text-green-600 shadow-green-200/50"
                : "bg-blue-100 text-blue-600 shadow-blue-200/50"
            )}
          >
            {icon}
          </div>

          {/* Trend indicator */}
          {trend !== undefined && trend !== 0 && (
            <div
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                trend > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              <svg
                className={cn("w-3 h-3", trend > 0 ? "rotate-0" : "rotate-180")}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <dt
            className={cn(
              "text-sm font-medium transition-colors duration-300",
              isUpdated ? "text-green-700" : "text-gray-600"
            )}
          >
            {title}
          </dt>

          <dd
            className={cn(
              "text-2xl lg:text-3xl font-bold transition-all duration-300 tracking-tight",
              isUpdated ? "text-green-900" : "text-gray-900",
              hasIncrease && "animate-pulse"
            )}
          >
            {value}
            {hasIncrease && (
              <span className="ml-2 inline-flex items-center text-lg font-medium text-green-600 animate-bounce">
                <svg
                  className="w-5 h-5"
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

          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
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
  const [revenueTrend, setRevenueTrend] = useState<number>(0);
  const [countTrend, setCountTrend] = useState<number>(0);
  const prevAnalyticsRef = useRef<Analytics | undefined>(undefined);

  // Detect analytics updates and add visual indicators
  useEffect(() => {
    const prevAnalytics = prevAnalyticsRef.current;

    if (prevAnalytics && analytics) {
      const updatedFieldsSet = new Set<string>();

      // Check for revenue changes
      if (prevAnalytics.totalRevenue !== analytics.totalRevenue) {
        updatedFieldsSet.add("revenue");
        const increased = analytics.totalRevenue > prevAnalytics.totalRevenue;
        setRevenueIncreased(increased);

        // Calculate percentage change
        if (prevAnalytics.totalRevenue > 0) {
          const change =
            ((analytics.totalRevenue - prevAnalytics.totalRevenue) /
              prevAnalytics.totalRevenue) *
            100;
          setRevenueTrend(change);
        }

        console.log("💰 Analytics: Revenue updated", {
          from: prevAnalytics.totalRevenue,
          to: analytics.totalRevenue,
          increased,
          trend: revenueTrend,
        });
      }

      // Check for transaction count changes
      if (prevAnalytics.transactionCount !== analytics.transactionCount) {
        updatedFieldsSet.add("count");
        const increased =
          analytics.transactionCount > prevAnalytics.transactionCount;
        setCountIncreased(increased);

        // Calculate percentage change
        if (prevAnalytics.transactionCount > 0) {
          const change =
            ((analytics.transactionCount - prevAnalytics.transactionCount) /
              prevAnalytics.transactionCount) *
            100;
          setCountTrend(change);
        }

        console.log("📊 Analytics: Transaction count updated", {
          from: prevAnalytics.transactionCount,
          to: analytics.transactionCount,
          increased,
          trend: countTrend,
        });
      }

      if (updatedFieldsSet.size > 0) {
        setUpdatedFields(updatedFieldsSet);

        // Clear indicators after animation
        setTimeout(() => {
          setUpdatedFields(new Set());
          setRevenueIncreased(false);
          setCountIncreased(false);
          setRevenueTrend(0);
          setCountTrend(0);
        }, 4000);
      }
    }

    // Update ref for next comparison
    prevAnalyticsRef.current = analytics;
  }, [analytics, revenueTrend, countTrend]);

  const calculateAverageTransaction = (): string => {
    if (!analytics || analytics.transactionCount === 0)
      return formatCurrency(0);
    const average = analytics.totalRevenue / analytics.transactionCount;
    return formatCurrency(average);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
        <StatCard
          title="Total Revenue"
          value={isLoading ? "—" : formatCurrency(analytics?.totalRevenue || 0)}
          isLoading={isLoading}
          isUpdated={updatedFields.has("revenue")}
          hasIncrease={revenueIncreased}
          trend={revenueTrend}
          description="All-time revenue from transactions"
          icon={
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />

        <StatCard
          title="Total Transactions"
          value={
            isLoading ? "—" : formatNumber(analytics?.transactionCount || 0)
          }
          isLoading={isLoading}
          isUpdated={updatedFields.has("count")}
          hasIncrease={countIncreased}
          trend={countTrend}
          description="Number of completed transactions"
          icon={
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          }
        />

        <StatCard
          title="Average Transaction"
          value={isLoading ? "—" : calculateAverageTransaction()}
          isLoading={isLoading}
          isUpdated={updatedFields.has("revenue") || updatedFields.has("count")}
          hasIncrease={revenueIncreased || countIncreased}
          description="Average value per transaction"
          icon={
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
