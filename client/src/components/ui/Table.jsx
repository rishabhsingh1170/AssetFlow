import React from "react";

export const Table = ({ children, className = "" }) => (
  <div className="w-full overflow-x-auto">
    <table className={`w-full text-left border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = "" }) => (
  <thead className={`bg-surface-2 border-b border-border ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = "" }) => (
  <tbody className={`divide-y divide-border bg-surface-1 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = "", onClick, hover = true }) => (
  <tr
    onClick={onClick}
    className={`transition-colors duration-150 ${
      hover ? "hover:bg-accent-50/60" : ""
    } ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary ${className}`}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className = "" }) => (
  <td className={`px-4 py-3.5 text-sm text-text-primary align-middle ${className}`}>
    {children}
  </td>
);

export default {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
