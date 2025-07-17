import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { Navigation } from "@/components/navigation";
import { PageErrorBoundary } from "@/components/error-boundary";
import { ConnectionBadge } from "@/components/websocket";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalos Sales Dashboard",
  description:
    "Real-time sales analytics dashboard with live transaction updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gradient-to-br from-gray-50 via-white to-gray-100`}
      >
        <Providers>
          <div className="flex min-h-full flex-col">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  {/* Logo and Title Section */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {/* Enhanced Logo */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
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
                      </div>

                      {/* Title */}
                      <div className="hidden sm:block">
                        <h1 className="text-xl font-bold text-gray-900">
                          Kalos Sales Dashboard
                        </h1>
                        <p className="text-xs text-gray-500 leading-none">
                          Real-time analytics
                        </p>
                      </div>

                      {/* Mobile Title */}
                      <div className="sm:hidden">
                        <h1 className="text-lg font-bold text-gray-900">
                          Kalos
                        </h1>
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className="hidden md:block">
                      <ConnectionBadge />
                    </div>
                  </div>

                  {/* Navigation and Actions */}
                  <div className="flex items-center space-x-3 sm:space-x-6">
                    {/* Mobile Connection Badge */}
                    <div className="md:hidden">
                      <ConnectionBadge />
                    </div>

                    <Navigation />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <PageErrorBoundary>{children}</PageErrorBoundary>
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white/50">
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>© 2024 Kalos Sales Dashboard</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      Real-time Analytics
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Built with Next.js & TypeScript</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Enhanced Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: "text-sm",
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                border: "1px solid #374151",
                borderRadius: "0.75rem",
                padding: "12px 16px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              },
              success: {
                duration: 3000,
                style: {
                  background: "#059669",
                  color: "#ffffff",
                  border: "1px solid #10b981",
                },
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#059669",
                },
              },
              error: {
                duration: 6000,
                style: {
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "1px solid #ef4444",
                },
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#dc2626",
                },
              },
              loading: {
                style: {
                  background: "#3b82f6",
                  color: "#ffffff",
                  border: "1px solid #60a5fa",
                },
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#3b82f6",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
