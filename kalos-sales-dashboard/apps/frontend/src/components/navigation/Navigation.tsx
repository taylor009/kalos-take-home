"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: "📊",
    description: "View analytics and transactions",
  },
  {
    href: "/add",
    label: "Add Transaction",
    icon: "➕",
    description: "Create new transaction",
  },
];

/**
 * Main navigation component with active states and accessibility
 */
export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="flex space-x-1 sm:space-x-8"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
            aria-current={isActive ? "page" : undefined}
            title={item.description}
          >
            <span className="mr-2 text-base" role="img" aria-hidden="true">
              {item.icon}
            </span>
            <span className="hidden sm:block">{item.label}</span>

            {/* Active indicator */}
            {isActive && (
              <div
                className="ml-2 h-2 w-2 rounded-full bg-blue-600"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Breadcrumb navigation component
 */
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Quick action buttons for common tasks
 */
export function QuickActions() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-3">
      {pathname !== "/add" && (
        <Link href="/add">
          <Button size="sm">
            <span className="mr-1">➕</span>
            Add Transaction
          </Button>
        </Link>
      )}

      {pathname !== "/" && (
        <Link href="/">
          <Button variant="secondary" size="sm">
            <span className="mr-1">📊</span>
            Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
