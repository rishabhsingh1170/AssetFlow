import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/common/EmptyState";
import AssetStatusBadge from "./AssetStatusBadge";
import { humanize } from "../../../utils/assetStatus";
import { formatCurrency } from "../../../utils/formatCurrency";

// Pure presenter: the page owns fetching, selection, and dialogs.
export const AssetTable = ({
  assets = [],
  onRowClick,
  onEdit,
  onDelete,
  canManage = false,
  onClearFilters,
}) => {
  if (!assets.length) {
    return (
      <EmptyState
        illustration="search"
        title="No assets match"
        description="Try a different search term or remove some filters to widen the results."
        action={
          onClearFilters && (
            <Button variant="secondary" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>Tag</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Cost</TableHead>
          {canManage && (
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.id} onClick={() => onRowClick?.(asset)}>
            <TableCell>
              <span className="inline-flex items-center font-mono text-[13px] bg-surface-2 border border-border rounded-default px-1.5 py-0.5 whitespace-nowrap">
                {asset.asset_tag || "-"}
              </span>
            </TableCell>
            <TableCell className="font-medium">{asset.name}</TableCell>
            <TableCell className="text-text-secondary">
              {asset.category_name || "-"}
            </TableCell>
            <TableCell>
              <AssetStatusBadge status={asset.status} />
            </TableCell>
            <TableCell className="text-text-secondary">
              {asset.condition ? humanize(asset.condition) : "-"}
            </TableCell>
            <TableCell className="text-text-secondary">
              {asset.owning_department_name || "-"}
            </TableCell>
            <TableCell className="text-text-secondary">
              {asset.location_name || "-"}
            </TableCell>
            <TableCell className="font-mono text-[13px] text-right whitespace-nowrap">
              {formatCurrency(asset.acquisition_cost)}
            </TableCell>
            {canManage && (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${asset.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(asset);
                    }}
                    className="p-1.5 rounded-default text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${asset.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete?.(asset);
                    }}
                    className="p-1.5 rounded-default text-text-muted hover:text-danger hover:bg-danger-bg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssetTable;
