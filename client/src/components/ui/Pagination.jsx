import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({ page, pageCount, onPageChange, className = "" }) => {
  if (!pageCount || pageCount <= 1) return null;

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="p-1.5 rounded-default border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="font-mono text-xs text-text-secondary">
        Page {page} of {pageCount}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="p-1.5 rounded-default border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
