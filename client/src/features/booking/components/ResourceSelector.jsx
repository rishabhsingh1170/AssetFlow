import React from "react";
import Select from "../../../components/ui/Select";
import { BOOKING_STATUSES } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";

export const ResourceSelector = ({ assets = [], filters, onChange }) => (
  <div className="flex flex-wrap items-end gap-3">
    <Select
      id="booking-resource-filter"
      label="Resource"
      className="max-w-xs"
      value={filters.assetId}
      onChange={(event) => onChange({ assetId: event.target.value })}
      options={[
        { value: "", label: "All shared resources" },
        ...assets.map((asset) => ({
          value: asset.id,
          label: `${asset.asset_tag || "Untagged"} - ${asset.name}`,
        })),
      ]}
    />

    <Select
      id="booking-status-filter"
      label="Status"
      className="max-w-45"
      value={filters.status}
      onChange={(event) => onChange({ status: event.target.value })}
      options={[
        { value: "", label: "All statuses" },
        ...BOOKING_STATUSES.map((status) => ({
          value: status,
          label: humanize(status),
        })),
      ]}
    />

    <label className="flex h-9 items-center gap-2 rounded-default border border-border-strong bg-surface-1 px-3 text-sm text-text-primary cursor-pointer select-none hover:bg-surface-2 transition-colors">
      <input
        type="checkbox"
        checked={filters.mineOnly}
        onChange={(event) => onChange({ mineOnly: event.target.checked })}
        className="accent-accent-500 cursor-pointer"
      />
      Mine only
    </label>
  </div>
);

export default ResourceSelector;
