import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Table Root Component
const Table = ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto">
    <table
      className={cn("min-w-full divide-y divide-gray-200", className)}
      {...props}
    />
  </div>
);

// Table Header Component
const TableHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-gray-50", className)} {...props} />
);

// Table Body Component
const TableBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody
    className={cn("bg-white divide-y divide-gray-200", className)}
    {...props}
  />
);

// Table Row Component
const TableRow = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn("hover:bg-gray-50 transition-colors", className)}
    {...props}
  />
);

// Table Head Cell Component
const TableHead = ({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      className
    )}
    {...props}
  />
);

// Table Cell Component
const TableCell = ({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
      className
    )}
    {...props}
  />
);

// Table Caption Component
const TableCaption = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption className={cn("mt-4 text-sm text-gray-500", className)} {...props} />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
