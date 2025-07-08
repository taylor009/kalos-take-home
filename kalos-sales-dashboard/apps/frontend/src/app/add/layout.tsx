import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Transaction | Kalos Sales Dashboard",
  description:
    "Create a new transaction record for the sales dashboard. Track customer transactions with real-time analytics updates.",
  keywords: ["transaction", "sales", "dashboard", "add", "create"],
};

export default function AddTransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
