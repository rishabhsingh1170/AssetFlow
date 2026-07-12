import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Skeleton from "../../../components/ui/Skeleton";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/common/EmptyState";
import { formatDate } from "../../../utils/formatDate";
import { usePagination } from "../../../hooks/usePagination";

const PAGE_SIZE = 15;

const ACTION_VARIANTS = {
  create: "success",
  update: "info",
  delete: "danger",
};

const actionVariant = (action = "") =>
  ACTION_VARIANTS[String(action).toLowerCase()] || "neutral";

const prettyJson = (value) => {
  if (value === null || value === undefined) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(value);
  }
};

const JsonColumn = ({ label, value }) => {
  const json = prettyJson(value);
  return (
    <div className="min-w-0">
      <p className="eyebrow mb-1.5">{label}</p>
      {json ? (
        <pre className="font-mono text-xs text-text-primary bg-surface-2 rounded p-3 overflow-x-auto">
          {json}
        </pre>
      ) : (
        <p className="text-xs text-text-muted italic">No data recorded</p>
      )}
    </div>
  );
};

// Filename kept from the original stub set; repurposed per the plan as the
// activity log table (audit checklists arrive with the audit-cycle backend).
export const AuditChecklistTable = ({ logs = [], loading = false, error = null }) => {
  const [expandedId, setExpandedId] = useState(null);
  const { page, setPage, totalPages, pageItems } = usePagination(logs, PAGE_SIZE);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 rounded-default border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        illustration="generic"
        title="No activity recorded yet"
        description="Server-side activity logging is not enabled. Once controllers write to activity_logs, entries appear here."
      />
    );
  }

  const toggleRow = (id) => setExpandedId((current) => (current === id ? null : id));

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            <TableHead className="w-10" />
            <TableHead>Time</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <React.Fragment key={log.id}>
                <TableRow onClick={() => toggleRow(log.id)}>
                  <TableCell className="w-10">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse log entry" : "Expand log entry"}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRow(log.id);
                      }}
                      className="p-1 rounded-default text-text-secondary hover:text-text-primary hover:bg-surface-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-[13px] whitespace-nowrap">
                    {formatDate(log.created_at, { withTime: true })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-text-primary">
                        {log.actor_name || "System"}
                      </p>
                      {log.actor_email && (
                        <p className="text-xs text-text-muted">{log.actor_email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-primary">{log.entity_table}</span>
                    {log.entity_id && (
                      <span className="ml-2 font-mono text-xs text-text-muted">
                        {String(log.entity_id).slice(0, 8)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow hover={false}>
                    <TableCell colSpan={5} className="bg-surface-2/50">
                      <div className="grid gap-4 sm:grid-cols-2 py-1">
                        <JsonColumn label="Before" value={log.before_data} />
                        <JsonColumn label="After" value={log.after_data} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border">
          <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AuditChecklistTable;
