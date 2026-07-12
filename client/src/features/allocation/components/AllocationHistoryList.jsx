import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import Skeleton from "../../../components/ui/Skeleton";
import EmptyState from "../../../components/common/EmptyState";
import StatusPill from "../../../components/common/StatusPill";
import { formatDate } from "../../../utils/formatDate";
import { fetchAllocationHistory } from "../allocation.slice";

export const AllocationHistoryList = () => {
  const dispatch = useDispatch();
  const { items, loading, unavailable } = useSelector(
    (state) => state.allocation.history
  );
  const requested = useRef(false);

  useEffect(() => {
    if (!requested.current) {
      requested.current = true;
      dispatch(fetchAllocationHistory());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (unavailable) {
    // BACKEND GAP: server/routes/allocation.routes.js is empty, so the
    // history call 404s. This state clears itself once the route is mounted.
    return (
      <EmptyState
        illustration="inbox"
        title="Allocation history is not available yet"
        description="The server does not mount GET /api/allocations yet. Mount it to enable this view."
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        illustration="inbox"
        title="No allocation records yet"
        description="Allocations and returns will appear here as custody changes."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>Asset</TableHead>
          <TableHead>Holder</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <span className="font-mono text-[13px]">{row.asset_tag || "-"}</span>
              {row.asset_name && (
                <span className="ml-2 text-text-secondary">{row.asset_name}</span>
              )}
            </TableCell>
            <TableCell>
              {row.holder_user_name || row.holder_department_name || "-"}
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5 font-mono text-[13px]">
                {formatDate(row.allocated_at)}
                <ArrowRight size={12} className="text-text-muted" aria-hidden="true" />
                {row.returned_at ? formatDate(row.returned_at) : "-"}
              </span>
            </TableCell>
            <TableCell>
              <StatusPill status={row.status} domain="allocation" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AllocationHistoryList;
